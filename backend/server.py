"""Standalone HealthLens Backend Server — Member 3.

Provides a robust HTTP server implementation using the Python Standard Library
(zero external dependencies required), ensuring immediate functionality and
testing on Python 3.13 without package installations.

Routes:
- GET  /api/v1/health   -> JSON status
- POST /api/v1/analyze  -> Validates lab data and returns structured report
- OPTIONS *             -> Handles CORS preflight for frontend integration
"""

import json
import sys
from http import HTTPStatus
from http.server import HTTPServer, BaseHTTPRequestHandler
from typing import Dict, Any, Tuple, Optional
from urllib.parse import urlparse

from .models import validate_analysis_request_payload
from .service import analyze_lab_report


def dispatch_api_request(method: str, path: str, payload: Optional[Any] = None) -> Tuple[int, Dict[str, Any]]:
    """Dispatches API requests to internal service handlers.

    Returns:
        Tuple of (HTTP status code, response data dictionary).
    """
    clean_path = urlparse(path).path.rstrip("/")
    if not clean_path:
        clean_path = "/"

    if method == "GET":
        if clean_path == "/api/v1/health":
            return int(HTTPStatus.OK), {
                "status": "healthy",
                "service": "HealthLens Backend",
                "framework": "StandardLibraryHTTP" if sys.modules.get("fastapi") is None else "FastAPI-Ready",
                "version": "0.1.0",
                "mode": "rule_based_baseline"
            }
        elif clean_path == "/":
            return int(HTTPStatus.OK), {
                "message": "HealthLens API v1 is running.",
                "endpoints": {
                    "health": "/api/v1/health",
                    "analyze": "/api/v1/analyze"
                }
            }
        else:
            return int(HTTPStatus.NOT_FOUND), {
                "error": "Not Found",
                "message": f"Endpoint '{clean_path}' does not exist on this server."
            }

    elif method == "POST":
        if clean_path == "/api/v1/analyze":
            if payload is None:
                return int(HTTPStatus.BAD_REQUEST), {
                    "error": "Missing Payload",
                    "message": "POST request requires a JSON body."
                }

            # Schema validation
            try:
                validated_payload = validate_analysis_request_payload(payload)
            except ValueError as ve:
                return int(HTTPStatus.UNPROCESSABLE_ENTITY), {
                    "error": "Validation Error",
                    "detail": str(ve)
                }

            # Processing analysis
            try:
                analysis_result = analyze_lab_report(validated_payload)
                return int(HTTPStatus.OK), analysis_result
            except Exception as e:
                return int(HTTPStatus.INTERNAL_SERVER_ERROR), {
                    "error": "Internal Error",
                    "message": f"Failed to process analysis: {str(e)}"
                }
        else:
            return int(HTTPStatus.NOT_FOUND), {
                "error": "Not Found",
                "message": f"POST endpoint '{clean_path}' does not exist."
            }

    return int(HTTPStatus.METHOD_NOT_ALLOWED), {
        "error": "Method Not Allowed",
        "message": f"HTTP method '{method}' is not supported on '{clean_path}'."
    }


class HealthLensRequestHandler(BaseHTTPRequestHandler):
    """HTTP Request Handler implementing HealthLens API v1 specification."""

    server_version = "HealthLensServer/0.1.0"

    def _set_cors_headers(self) -> None:
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")

    def _send_json_response(self, status_code: int, data: Dict[str, Any]) -> None:
        response_bytes = json.dumps(data, indent=2).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(response_bytes)))
        self._set_cors_headers()
        self.end_headers()
        self.wfile.write(response_bytes)

    def do_OPTIONS(self) -> None:
        """Handle CORS preflight requests."""
        self.send_response(HTTPStatus.NO_CONTENT)
        self._set_cors_headers()
        self.end_headers()

    def do_GET(self) -> None:
        status_code, response_data = dispatch_api_request("GET", self.path, None)
        self._send_json_response(status_code, response_data)

    def do_POST(self) -> None:
        content_length = self.headers.get("Content-Length")
        if not content_length:
            self._send_json_response(int(HTTPStatus.BAD_REQUEST), {
                "error": "Missing Content-Length",
                "message": "Request must include Content-Length header."
            })
            return

        try:
            body_bytes = self.rfile.read(int(content_length))
            payload = json.loads(body_bytes.decode("utf-8"))
        except (json.JSONDecodeError, UnicodeDecodeError) as e:
            self._send_json_response(int(HTTPStatus.BAD_REQUEST), {
                "error": "Invalid JSON",
                "message": f"Failed to parse JSON body: {str(e)}"
            })
            return

        status_code, response_data = dispatch_api_request("POST", self.path, payload)
        self._send_json_response(status_code, response_data)

    def log_message(self, format: str, *args: Any) -> None:
        """Suppress standard stderr access logging to keep console/test output clean."""
        pass


def run_server(host: str = "127.0.0.1", port: int = 8000) -> None:
    """Starts the HealthLens backend server."""
    server = HTTPServer((host, port), HealthLensRequestHandler)
    print(f"HealthLens Backend Server listening at http://{host}:{port}/")
    print("Available endpoints:")
    print(f"  GET  http://{host}:{port}/api/v1/health")
    print(f"  POST http://{host}:{port}/api/v1/analyze")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down HealthLens server gracefully.")
        server.server_close()


if __name__ == "__main__":
    host = "127.0.0.1"
    port = 8000
    if len(sys.argv) > 1:
        port = int(sys.argv[1])
    run_server(host=host, port=port)
