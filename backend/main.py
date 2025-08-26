from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit, join_room, leave_room
import json
import re
from datetime import datetime
import uuid

app = Flask(__name__)
app.config['SECRET_KEY'] = 'eco-ctf-chat-secret-key'
CORS(app, origins="*")
socketio = SocketIO(app, cors_allowed_origins="*")

# In-memory storage (in production, use a database)
messages = {
    'global': [],
    'teams': {}
}

# Connected users
connected_users = {}

# Blocked users
blocked_users = set()
muted_users = set()

# Admin logs
admin_logs = []

# Flag patterns to detect and block
FLAG_PATTERNS = [
    r'flag\{[^}]+\}',
    r'ctf\{[^}]+\}',
    r'eco\{[^}]+\}',
    r'[a-f0-9]{32}',  # MD5 hash pattern
    r'[a-f0-9]{40}',  # SHA1 hash pattern
]

def is_flag_content(message):
    """Check if message contains flag-like content"""
    message_lower = message.lower()
    for pattern in FLAG_PATTERNS:
        if re.search(pattern, message_lower):
            return True
    return False

def sanitize_message(message):
    """Remove or mask flag content from message"""
    for pattern in FLAG_PATTERNS:
        message = re.sub(pattern, '[FLAG_BLOCKED]', message, flags=re.IGNORECASE)
    return message

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'service': 'eco-ctf-chat'})

@app.route('/api/messages/<channel_type>', methods=['GET'])
def get_messages(channel_type):
    """Get messages for a specific channel"""
    try:
        if channel_type == 'global':
            return jsonify({'messages': messages['global']})
        elif channel_type.startswith('team_'):
            team_id = channel_type.replace('team_', '')
            if team_id not in messages['teams']:
                messages['teams'][team_id] = []
            return jsonify({'messages': messages['teams'][team_id]})
        else:
            return jsonify({'error': 'Invalid channel type'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@socketio.on('connect')
def handle_connect():
    print(f'User connected: {request.sid}')
    emit('connected', {'status': 'Connected to Eco CTF Chat'})

@socketio.on('disconnect')
def handle_disconnect():
    print(f'User disconnected: {request.sid}')
    if request.sid in connected_users:
        user_data = connected_users[request.sid]
        # Leave all rooms
        if 'team_id' in user_data:
            leave_room(f"team_{user_data['team_id']}")
        leave_room('global')
        del connected_users[request.sid]

@socketio.on('join_chat')
def handle_join_chat(data):
    """User joins chat with their info"""
    try:
        user_id = data.get('user_id')
        username = data.get('username')
        team_id = data.get('team_id')
        team_name = data.get('team_name')
        is_admin = data.get('is_admin', False)
        
        # Store user info
        connected_users[request.sid] = {
            'user_id': user_id,
            'username': username,
            'team_id': team_id,
            'team_name': team_name,
            'is_admin': is_admin
        }
        
        # Join global room
        join_room('global')
        
        # Join team room if applicable
        if team_id:
            join_room(f'team_{team_id}')
            if team_id not in messages['teams']:
                messages['teams'][team_id] = []
        
        emit('join_success', {
            'message': f'Welcome to Eco CTF Chat, {username}!',
            'user_info': connected_users[request.sid]
        })
        
        # Notify others in global chat
        socketio.emit('user_joined', {
            'username': username,
            'team_name': team_name,
            'timestamp': datetime.now().isoformat()
        }, room='global')
        
    except Exception as e:
        emit('error', {'message': f'Failed to join chat: {str(e)}'})

@socketio.on('send_message')
def handle_send_message(data):
    """Handle sending messages"""
    try:
        if request.sid not in connected_users:
            emit('error', {'message': 'User not authenticated'})
            return
        
        user_data = connected_users[request.sid]
        user_id = user_data['user_id']
        
        # Check if user is blocked
        if user_id in blocked_users:
            emit('error', {'message': 'You have been blocked from sending messages'})
            return
        
        # Check if user is muted
        if user_id in muted_users:
            emit('error', {'message': 'You have been muted and cannot send messages'})
            return
        
        channel_type = data.get('channel_type')  # 'global' or 'team'
        message_text = data.get('message', '').strip()
        
        if not message_text:
            emit('error', {'message': 'Message cannot be empty'})
            return
        
        # Check for flag content in global chat
        if channel_type == 'global' and not user_data.get('is_admin', False):
            if is_flag_content(message_text):
                emit('message_blocked', {
                    'reason': 'Flag sharing is not allowed in global chat',
                    'message': 'Please use team chat to share flags with your teammates.'
                })
                return
        
        # Create message object
        message_obj = {
            'id': str(uuid.uuid4()),
            'user_id': user_data['user_id'],
            'username': user_data['username'],
            'team_id': user_data.get('team_id'),
            'team_name': user_data.get('team_name'),
            'is_admin': user_data.get('is_admin', False),
            'message': message_text,
            'timestamp': datetime.now().isoformat(),
            'channel_type': channel_type
        }
        
        # Store and broadcast message
        if channel_type == 'global':
            messages['global'].append(message_obj)
            # Keep only last 100 messages
            if len(messages['global']) > 100:
                messages['global'] = messages['global'][-100:]
            
            socketio.emit('new_message', message_obj, room='global')
            
        elif channel_type == 'team' and user_data.get('team_id'):
            team_id = user_data['team_id']
            if team_id not in messages['teams']:
                messages['teams'][team_id] = []
            
            messages['teams'][team_id].append(message_obj)
            # Keep only last 50 messages per team
            if len(messages['teams'][team_id]) > 50:
                messages['teams'][team_id] = messages['teams'][team_id][-50:]
            
            socketio.emit('new_message', message_obj, room=f'team_{team_id}')
        
        else:
            emit('error', {'message': 'Invalid channel or no team assigned'})
            
    except Exception as e:
        emit('error', {'message': f'Failed to send message: {str(e)}'})

@socketio.on('typing')
def handle_typing(data):
    """Handle typing indicators"""
    try:
        if request.sid not in connected_users:
            return
        
        user_data = connected_users[request.sid]
        channel_type = data.get('channel_type')
        is_typing = data.get('is_typing', False)
        
        typing_data = {
            'username': user_data['username'],
            'team_name': user_data.get('team_name'),
            'is_typing': is_typing,
            'timestamp': datetime.now().isoformat()
        }
        
        if channel_type == 'global':
            socketio.emit('user_typing', typing_data, room='global', include_self=False)
        elif channel_type == 'team' and user_data.get('team_id'):
            socketio.emit('user_typing', typing_data, room=f"team_{user_data['team_id']}", include_self=False)
            
    except Exception as e:
        print(f"Typing error: {str(e)}")

@socketio.on('admin_broadcast')
def handle_admin_broadcast(data):
    """Handle admin broadcast messages"""
    try:
        if request.sid not in connected_users:
            emit('error', {'message': 'User not authenticated'})
            return
        
        user_data = connected_users[request.sid]
        if not user_data.get('is_admin', False):
            emit('error', {'message': 'Admin privileges required'})
            return
        
        message_text = data.get('message', '').strip()
        if not message_text:
            emit('error', {'message': 'Message cannot be empty'})
            return
        
        # Create admin broadcast message
        admin_message = {
            'id': str(uuid.uuid4()),
            'user_id': user_data['user_id'],
            'username': user_data['username'],
            'is_admin': True,
            'message': message_text,
            'timestamp': datetime.now().isoformat(),
            'channel_type': 'admin_broadcast',
            'is_broadcast': True
        }
        
        # Store in global messages
        messages['global'].append(admin_message)
        
        # Broadcast to all users
        socketio.emit('admin_broadcast', admin_message)
        
    except Exception as e:
        emit('error', {'message': f'Failed to send admin broadcast: {str(e)}'})

if __name__ == '__main__':
    print("🌱 Starting Eco CTF Chat Server...")
    print("🚀 Server running on http://0.0.0.0:5000")
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)



def log_admin_action(admin_user, action, target_user=None, details=None):
    """Log admin actions for accountability"""
    log_entry = {
        'id': str(uuid.uuid4()),
        'admin_user': admin_user,
        'action': action,
        'target_user': target_user,
        'details': details,
        'timestamp': datetime.now().isoformat()
    }
    admin_logs.append(log_entry)
    # Keep only last 1000 logs
    if len(admin_logs) > 1000:
        admin_logs[:] = admin_logs[-1000:]

@app.route('/api/admin/users', methods=['GET'])
def get_all_users():
    """Admin endpoint to get all connected users"""
    try:
        # Check if requester is admin (in production, use proper auth)
        admin_check = request.headers.get('X-Admin-Token')
        if admin_check != 'admin-secret-token':
            return jsonify({'error': 'Admin access required'}), 403
        
        users_list = []
        for sid, user_data in connected_users.items():
            users_list.append({
                'session_id': sid,
                'user_id': user_data['user_id'],
                'username': user_data['username'],
                'team_id': user_data.get('team_id'),
                'team_name': user_data.get('team_name'),
                'is_admin': user_data.get('is_admin', False),
                'is_blocked': user_data['user_id'] in blocked_users,
                'is_muted': user_data['user_id'] in muted_users
            })
        
        return jsonify({
            'users': users_list,
            'total_users': len(users_list),
            'blocked_count': len(blocked_users),
            'muted_count': len(muted_users)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/messages/all', methods=['GET'])
def get_all_messages():
    """Admin endpoint to get all messages from all channels"""
    try:
        admin_check = request.headers.get('X-Admin-Token')
        if admin_check != 'admin-secret-token':
            return jsonify({'error': 'Admin access required'}), 403
        
        all_messages = {
            'global': messages['global'],
            'teams': messages['teams']
        }
        
        return jsonify({'messages': all_messages})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/message/delete', methods=['DELETE'])
def delete_message():
    """Admin endpoint to delete specific message"""
    try:
        admin_check = request.headers.get('X-Admin-Token')
        if admin_check != 'admin-secret-token':
            return jsonify({'error': 'Admin access required'}), 403
        
        data = request.get_json()
        message_id = data.get('message_id')
        channel_type = data.get('channel_type')
        team_id = data.get('team_id')
        admin_user = data.get('admin_user', 'Unknown Admin')
        
        message_deleted = False
        deleted_message = None
        
        if channel_type == 'global':
            for i, msg in enumerate(messages['global']):
                if msg['id'] == message_id:
                    deleted_message = messages['global'].pop(i)
                    message_deleted = True
                    break
        elif channel_type == 'team' and team_id:
            if team_id in messages['teams']:
                for i, msg in enumerate(messages['teams'][team_id]):
                    if msg['id'] == message_id:
                        deleted_message = messages['teams'][team_id].pop(i)
                        message_deleted = True
                        break
        
        if message_deleted:
            # Log admin action
            log_admin_action(
                admin_user, 
                'DELETE_MESSAGE', 
                deleted_message['username'],
                f"Deleted message: '{deleted_message['message'][:50]}...'"
            )
            
            # Notify all users about message deletion
            socketio.emit('message_deleted', {
                'message_id': message_id,
                'channel_type': channel_type,
                'team_id': team_id,
                'deleted_by_admin': True
            })
            
            return jsonify({'success': True, 'message': 'Message deleted successfully'})
        else:
            return jsonify({'error': 'Message not found'}), 404
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/user/block', methods=['POST'])
def block_user():
    """Admin endpoint to block user from chat or platform"""
    try:
        admin_check = request.headers.get('X-Admin-Token')
        if admin_check != 'admin-secret-token':
            return jsonify({'error': 'Admin access required'}), 403
        
        data = request.get_json()
        user_id = data.get('user_id')
        block_type = data.get('block_type', 'chat')  # 'chat' or 'platform'
        admin_user = data.get('admin_user', 'Unknown Admin')
        reason = data.get('reason', 'No reason provided')
        
        blocked_users.add(user_id)
        
        # Log admin action
        log_admin_action(
            admin_user,
            f'BLOCK_USER_{block_type.upper()}',
            user_id,
            f"Reason: {reason}"
        )
        
        # Disconnect user if currently connected
        user_sessions = [sid for sid, user_data in connected_users.items() 
                        if user_data['user_id'] == user_id]
        
        for session_id in user_sessions:
            socketio.emit('user_blocked', {
                'reason': reason,
                'block_type': block_type,
                'blocked_by_admin': True
            }, room=session_id)
            
            # Disconnect from socket
            socketio.disconnect(session_id)
        
        return jsonify({'success': True, 'message': f'User {user_id} blocked successfully'})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/user/mute', methods=['POST'])
def mute_user():
    """Admin endpoint to mute user (can read but not send messages)"""
    try:
        admin_check = request.headers.get('X-Admin-Token')
        if admin_check != 'admin-secret-token':
            return jsonify({'error': 'Admin access required'}), 403
        
        data = request.get_json()
        user_id = data.get('user_id')
        admin_user = data.get('admin_user', 'Unknown Admin')
        reason = data.get('reason', 'No reason provided')
        duration = data.get('duration', 'permanent')  # in minutes or 'permanent'
        
        muted_users.add(user_id)
        
        # Log admin action
        log_admin_action(
            admin_user,
            'MUTE_USER',
            user_id,
            f"Reason: {reason}, Duration: {duration}"
        )
        
        # Notify user
        user_sessions = [sid for sid, user_data in connected_users.items() 
                        if user_data['user_id'] == user_id]
        
        for session_id in user_sessions:
            socketio.emit('user_muted', {
                'reason': reason,
                'duration': duration,
                'muted_by_admin': True
            }, room=session_id)
        
        return jsonify({'success': True, 'message': f'User {user_id} muted successfully'})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/user/unblock', methods=['POST'])
def unblock_user():
    """Admin endpoint to unblock user"""
    try:
        admin_check = request.headers.get('X-Admin-Token')
        if admin_check != 'admin-secret-token':
            return jsonify({'error': 'Admin access required'}), 403
        
        data = request.get_json()
        user_id = data.get('user_id')
        admin_user = data.get('admin_user', 'Unknown Admin')
        
        blocked_users.discard(user_id)
        muted_users.discard(user_id)
        
        # Log admin action
        log_admin_action(admin_user, 'UNBLOCK_USER', user_id)
        
        return jsonify({'success': True, 'message': f'User {user_id} unblocked successfully'})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/logs', methods=['GET'])
def get_admin_logs():
    """Get admin action logs"""
    try:
        admin_check = request.headers.get('X-Admin-Token')
        if admin_check != 'admin-secret-token':
            return jsonify({'error': 'Admin access required'}), 403
        
        # Get last 100 logs
        recent_logs = admin_logs[-100:] if len(admin_logs) > 100 else admin_logs
        
        return jsonify({
            'logs': recent_logs,
            'total_logs': len(admin_logs)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@socketio.on('admin_monitor_request')
def handle_admin_monitor_request(data):
    """Handle admin request to monitor specific team chat"""
    try:
        if request.sid not in connected_users:
            emit('error', {'message': 'User not authenticated'})
            return
        
        user_data = connected_users[request.sid]
        if not user_data.get('is_admin', False):
            emit('error', {'message': 'Admin privileges required'})
            return
        
        team_id = data.get('team_id')
        if team_id and team_id in messages['teams']:
            emit('admin_team_messages', {
                'team_id': team_id,
                'messages': messages['teams'][team_id]
            })
        else:
            emit('error', {'message': 'Team not found'})
            
    except Exception as e:
        emit('error', {'message': f'Failed to get team messages: {str(e)}'})


if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug=False)

