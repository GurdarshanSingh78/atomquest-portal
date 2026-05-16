import json
from http.server import BaseHTTPRequestHandler
from db import get_db

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            data = json.loads(body)
            
            goals = data.get('goals', [])
            user_id = data.get('user_id') # In production, this comes from the auth session
            
            if not goals:
                return self.send_json_response(400, {"error": "Goal sheet cannot be empty."})
                
            if len(goals) > 8:
                return self.send_json_response(400, {"error": "BRD Violation: Maximum 8 goals allowed per employee."})
            
            total_weightage = 0
            for goal in goals:
                weight = float(goal.get('weightage', 0))
                
                if weight < 10:
                    return self.send_json_response(400, {"error": f"BRD Violation: Goal '{goal.get('title')}' has weightage under 10%."})
                
                total_weightage += weight
                
            if total_weightage != 100:
                return self.send_json_response(400, {"error": f"BRD Violation: Total weightage must be exactly 100%. Current total: {total_weightage}%"})
            
            supabase = get_db()
            
            inserted_goals = []
            for goal in goals:
                db_record = {
                    "user_id": user_id,
                    "title": goal.get('title'),
                    "thrust_area": goal.get('thrustArea'),
                    "uom_type": goal.get('uom'),
                    "target": float(goal.get('target')) if goal.get('uom') != 'Timeline' else 0, # Handle dates separately if needed
                    "weightage": float(goal.get('weightage')),
                    "is_locked": False
                }
                
                response = supabase.table('goals').insert(db_record).execute()
                inserted_goals.append(response.data[0])
            
            return self.send_json_response(200, {
                "success": True, 
                "message": "Goals validated and submitted successfully.",
                "data": inserted_goals
            })
            
        except Exception as e:
            return self.send_json_response(500, {"error": f"Internal Server Error: {str(e)}"})

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