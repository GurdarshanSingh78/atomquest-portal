import json
from http.server import BaseHTTPRequestHandler
from db import get_db

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            data = json.loads(body)
            
            # Simulated Azure ID Token payload passed from frontend Microsoft MSAL wrapper
            id_token_claims = data.get('token_claims')
            
            if not id_token_claims:
                return self.send_json_response(400, {"error": "Missing identity assertion claims."})
                
            email = id_token_claims.get('preferred_username')
            name = id_token_claims.get('name')
            # AD Group OIDs mapped directly to system privileges
            ad_groups = id_token_claims.get('roles', []) 
            # Manager Object ID mapped from Azure AD Graph profile attributes
            azure_manager_email = id_token_claims.get('manager_email') 
            
            # 1. Determine Access Role derived from Entra Group claim membership
            assigned_role = 'Employee'
            if 'Nexus.GlobalAdmin' in ad_groups or 'HR-Core-Group' in ad_groups:
                assigned_role = 'Admin'
            elif 'Nexus.L1Managers' in ad_groups:
                assigned_role = 'Manager'
                
            supabase = get_db()
            
            # 2. Resolve or create reporting lines if manager profile exists
            manager_uuid = None
            if azure_manager_email:
                mgr_res = supabase.table('users').select('id').eq('email', azure_manager_email).execute()
                if mgr_res.data:
                    manager_uuid = mgr_res.data[0]['id']
            
            # 3. Synchronize Entra directory identities directly into system schema ledger
            user_record = {
                "full_name": name,
                "email": email,
                "role": assigned_role,
                "manager_id": manager_uuid
            }
            
            existing_user = supabase.table('users').select('id').eq('email', email).execute()
            if existing_user.data:
                res = supabase.table('users').update(user_record).eq('id', existing_user.data[0]['id']).execute()
            else:
                res = supabase.table('users').insert(user_record).execute()
                
            return self.send_json_response(200, {
                "success": True,
                "message": "Entra directory verification synced cleanly.",
                "profile": res.data[0]
            })
            
        except Exception as e:
            return self.send_json_response(500, {"error": f"Identity Synchronization Mismatch: {str(e)}"})

    def send_json_response(self, status_code, payload):
        self.send_response(status_code)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(payload).encode('utf-8'))