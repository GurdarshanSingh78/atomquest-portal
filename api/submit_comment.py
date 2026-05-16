import json
from http.server import BaseHTTPRequestHandler
from db import get_db

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            data = json.loads(body)
            
            check_in_id = data.get('check_in_id')
            comment = data.get('comment')
            
            if not check_in_id or not comment:
                return self.send_json_response(400, {"error": "Missing log identifiers or comment data."})
                
            supabase = get_db()
            response = supabase.table('check_ins').update({"manager_comment": comment}).eq('id', check_in_id).execute()
            
            return self.send_json_response(200, {
                "success": True,
                "message": "Feedback logged in core ledger.",
                "data": response.data[0]
            })
            
        except Exception as e:
            return self.send_json_response(500, {"error": f"System Exception: {str(e)}"})

    def send_json_response(self, status_code, payload):
        self.send_response(status_code)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*') 
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        self.wfile.write(json.dumps(payload).encode('utf-8'))
        
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()