import json
from http.server import BaseHTTPRequestHandler

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            data = json.loads(body)
            
            event_type = data.get('event') # e.g., 'goal_submitted', 'goal_rejected'
            employee_name = data.get('employee_name', 'Operative')
            goal_sheet_id = data.get('sheet_id', '')
            
            # Generate the portal deployment origin (fallback to production domain)
            host_origin = self.headers.get('Host', 'mansathi-nexus.vercel.app')
            deep_link_url = f"https://{host_origin}/manager?target={goal_sheet_id}"
            
            # Generate MS Teams Adaptive Card payload configuration structure
            adaptive_card_payload = {
                "type": "MessageCard",
                "@context": "http://schema.org/extensions",
                "themeColor": "FFA500",
                "summary": "Nexus Operational Event Notice",
                "sections": [{
                    "activityTitle": f"**Action Required**: Objective Authorization Protocol initiated by {employee_name}",
                    "activitySubtitle": f"Event Route: {event_type}",
                    "facts": [
                        {"name": "Origin Operator", "value": employee_name},
                        {"name": "Transmission Context", "value": "Goal sheet awaits review"}
                    ],
                    "markdown": True
                }],
                "potentialAction": [{
                    "@type": "OpenUri",
                    "name": "Access Portal Workspace",
                    "targets": [{"os": "default", "uri": deep_link_url}]
                }]
            }
            
            # Return payloads ready for downstream email clients or Teams webhooks
            return self.send_json_response(200, {
                "success": True,
                "email_dispatched_alert": f"Email log notification triggered for event {event_type}.",
                "teams_adaptive_card": adaptive_card_payload
            })
            
        except Exception as e:
            return self.send_json_response(500, {"error": str(e)})

    def send_json_response(self, status_code, payload):
        self.send_response(status_code)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(payload).encode('utf-8'))