import os
import sys
import unittest
from contextlib import ExitStack
from datetime import datetime
from pathlib import Path
from unittest.mock import AsyncMock, patch
from uuid import uuid4

from fastapi.testclient import TestClient


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))


os.environ.setdefault("DATABASE_URL", "postgresql+psycopg://user:pass@localhost:5432/testdb")
os.environ.setdefault("REDIS_URL", "redis://localhost:6379")
os.environ.setdefault("CLERK_SECRET_KEY", "dummy")
os.environ.setdefault("CLERK_JWT_ISSUER", "https://clerk.invalid")
os.environ.setdefault("GEMINI_API_KEY", "dummy")
os.environ.setdefault("IMAGEKIT_PUBLIC_KEY", "dummy")
os.environ.setdefault("IMAGEKIT_PRIVATE_KEY", "dummy")
os.environ.setdefault("IMAGEKIT_URL_ENDPOINT", "https://imagekit.invalid")
os.environ.setdefault("RAZORPAY_KEY_ID", "dummy")
os.environ.setdefault("RAZORPAY_KEY_SECRET", "dummy")


from app.api.deps import get_current_user
from app.db.session import get_session
from app.main import app
from app.modules.payments.models import Payment
from app.modules.users.models import User


NOW = datetime(2026, 1, 1, 12, 0, 0)
USER_ID = uuid4()
OFFICER_ID = uuid4()
DOCUMENT_TYPE_ID = uuid4()
APPLICATION_ID = uuid4()
PROOF_ID = uuid4()
GRIEVANCE_ID = uuid4()
PAYMENT_ID = uuid4()
CHAT_SESSION_ID = uuid4()
CHAT_MESSAGE_ID = uuid4()
AUDIT_ID = uuid4()


FAKE_ADMIN_USER = User(
    id=USER_ID,
    clerk_user_id="clerk_test_user",
    email="admin@example.com",
    full_name="Admin User",
    phone="9999999999",
    avatar_url=None,
    role="ADMIN",
    is_active=True,
    created_at=NOW,
    updated_at=NOW,
)


def make_user_payload(role: str = "USER") -> dict:
    return {
        "id": str(uuid4()),
        "clerk_user_id": f"clerk_{role.lower()}",
        "email": f"{role.lower()}@example.com",
        "full_name": f"{role.title()} User",
        "phone": "9999999999",
        "avatar_url": None,
        "role": role,
        "is_active": True,
        "created_at": NOW,
        "updated_at": NOW,
    }


def make_document_type_payload() -> dict:
    return {
        "id": str(DOCUMENT_TYPE_ID),
        "name": "Birth Certificate",
        "slug": "birth-certificate",
        "description": "Certificate request",
        "required_documents": [{"name": "Aadhaar", "type": "pdf"}],
        "fee_amount": 25.0,
        "processing_days": 7,
        "is_active": True,
        "created_at": NOW,
    }


def make_application_payload(status: str = "SUBMITTED") -> dict:
    return {
        "id": str(APPLICATION_ID),
        "application_number": "APP-20260101-0001",
        "user_id": str(USER_ID),
        "document_type_id": str(DOCUMENT_TYPE_ID),
        "assigned_officer_id": str(OFFICER_ID),
        "status": status,
        "remarks": "Reviewed",
        "submitted_at": NOW,
        "created_at": NOW,
        "proofs": [
            {
                "id": str(PROOF_ID),
                "file_url": "https://example.com/proof.pdf",
                "mime_type": "application/pdf",
                "file_type": "AADHAAR",
                "uploaded_by": str(USER_ID),
                "created_at": NOW,
            }
        ],
    }


def make_grievance_payload(status: str = "OPEN") -> dict:
    return {
        "id": str(GRIEVANCE_ID),
        "ticket_number": "TKT-20260101-ABCD12",
        "user_id": str(USER_ID),
        "assigned_officer_id": str(OFFICER_ID),
        "subject": "Water issue",
        "description": "No water supply in the area",
        "category": "Water",
        "status": status,
        "resolution_notes": "Resolved quickly" if status == "RESOLVED" else None,
        "created_at": NOW,
        "resolved_at": NOW if status == "RESOLVED" else None,
    }


def make_payment_order_payload() -> dict:
    return {
        "payment_id": str(PAYMENT_ID),
        "provider_order_id": "order_test_123",
        "amount": 100.0,
        "currency": "INR",
        "status": "PENDING",
    }


def make_payment_payload(status: str = "SUCCESS") -> dict:
    return {
        "id": str(PAYMENT_ID),
        "user_id": str(USER_ID),
        "application_id": str(APPLICATION_ID),
        "payment_type": "CERTIFICATE_FEE",
        "amount": 100.0,
        "currency": "INR",
        "status": status,
        "provider_order_id": "order_test_123",
        "provider_payment_id": "pay_test_123" if status == "SUCCESS" else None,
        "created_at": NOW,
        "paid_at": NOW if status == "SUCCESS" else None,
    }


def make_chat_session_payload() -> dict:
    return {
        "id": str(CHAT_SESSION_ID),
        "user_id": str(USER_ID),
        "title": "Support Chat",
        "created_at": NOW,
        "updated_at": NOW,
    }


def make_chat_message_payload(role: str = "assistant") -> dict:
    return {
        "id": str(CHAT_MESSAGE_ID),
        "session_id": str(CHAT_SESSION_ID),
        "role": role,
        "message": "Hello from the assistant",
        "metadata_info": {"source": "smoke-test"},
        "created_at": NOW,
    }


def make_audit_log_payload() -> dict:
    return {
        "id": str(AUDIT_ID),
        "actor_user_id": str(OFFICER_ID),
        "action": "APPROVED_APPLICATION",
        "resource_type": "document_applications",
        "resource_id": str(APPLICATION_ID),
        "metadata_info": {"remarks": "Looks good"},
        "created_at": NOW,
    }


class FakePaymentRepository:
    def __init__(self, session):
        self.session = session
        self.updated_payment = None

    def get_by_provider_order_id(self, order_id: str):
        return Payment(
            id=PAYMENT_ID,
            user_id=USER_ID,
            application_id=APPLICATION_ID,
            payment_type="CERTIFICATE_FEE",
            amount=100.0,
            currency="INR",
            status="PENDING",
            provider_order_id=order_id,
            provider_payment_id=None,
            created_at=NOW,
            paid_at=None,
        )

    def update(self, payment: Payment):
        self.updated_payment = payment
        return payment


def fake_session():
    return object()


async def fake_current_user():
    return FAKE_ADMIN_USER


class ApiSmokeTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.stack = ExitStack()
        app.dependency_overrides[get_session] = fake_session
        app.dependency_overrides[get_current_user] = fake_current_user

        cls.stack.enter_context(
            patch(
                "app.modules.documents.service.get_all_document_types",
                new=AsyncMock(return_value=[make_document_type_payload()]),
            )
        )
        cls.stack.enter_context(
            patch(
                "app.modules.documents.service.get_document_type_by_slug",
                new=AsyncMock(return_value=make_document_type_payload()),
            )
        )
        cls.stack.enter_context(
            patch(
                "app.modules.applications.service.create_application",
                return_value=make_application_payload(),
            )
        )
        cls.stack.enter_context(
            patch(
                "app.modules.applications.service.get_user_applications",
                return_value=[make_application_payload()],
            )
        )
        cls.stack.enter_context(
            patch(
                "app.modules.applications.service.get_application_by_id",
                return_value=make_application_payload(),
            )
        )
        cls.stack.enter_context(
            patch(
                "app.modules.officer.service.get_all_applications",
                return_value=[make_application_payload()],
            )
        )
        cls.stack.enter_context(
            patch(
                "app.modules.officer.service.review_application",
                side_effect=[
                    make_application_payload(status="APPROVED"),
                    make_application_payload(status="REJECTED"),
                ],
            )
        )
        cls.stack.enter_context(
            patch(
                "app.modules.officer.service.issue_document",
                return_value={"status": "issued", "application_id": str(APPLICATION_ID)},
            )
        )
        cls.stack.enter_context(
            patch(
                "app.modules.admin.service.get_users_by_role",
                side_effect=[
                    [make_user_payload("USER")],
                    [make_user_payload("OFFICER")],
                    [make_user_payload("ADMIN")],
                ],
            )
        )
        cls.stack.enter_context(
            patch(
                "app.modules.admin.service.get_recent_audit_logs",
                return_value=[make_audit_log_payload()],
            )
        )
        cls.stack.enter_context(
            patch(
                "app.modules.grievances.service.create_grievance",
                return_value=make_grievance_payload(),
            )
        )
        cls.stack.enter_context(
            patch(
                "app.modules.grievances.service.get_grievances",
                return_value=[make_grievance_payload()],
            )
        )
        cls.stack.enter_context(
            patch(
                "app.modules.grievances.service.get_grievance_by_id",
                return_value=make_grievance_payload(),
            )
        )
        cls.stack.enter_context(
            patch(
                "app.modules.grievances.service.update_grievance_status",
                return_value=make_grievance_payload(status="RESOLVED"),
            )
        )
        cls.stack.enter_context(
            patch(
                "app.modules.payments.service.create_payment_order",
                return_value=make_payment_order_payload(),
            )
        )
        cls.stack.enter_context(
            patch(
                "app.modules.payments.service.verify_payment",
                return_value=make_payment_payload(),
            )
        )
        cls.stack.enter_context(
            patch(
                "app.modules.payments.service.get_user_payments",
                return_value=[make_payment_payload()],
            )
        )
        cls.stack.enter_context(
            patch(
                "app.modules.chat.service.create_chat_session",
                return_value=make_chat_session_payload(),
            )
        )
        cls.stack.enter_context(
            patch(
                "app.modules.chat.service.get_chat_history",
                return_value=[make_chat_session_payload()],
            )
        )
        cls.stack.enter_context(
            patch(
                "app.modules.chat.service.get_messages",
                return_value=[make_chat_message_payload(role="assistant")],
            )
        )
        cls.stack.enter_context(
            patch(
                "app.modules.chat.service.send_message",
                new=AsyncMock(return_value=make_chat_message_payload(role="assistant")),
            )
        )
        cls.stack.enter_context(
            patch(
                "app.modules.dashboard.service.get_admin_dashboard_summary",
                new=AsyncMock(
                    return_value={
                        "total_applications": 12,
                        "pending_applications": 5,
                        "approved_applications": 7,
                        "total_grievances": 6,
                        "pending_grievances": 2,
                    }
                ),
            )
        )
        cls.stack.enter_context(
            patch(
                "app.modules.uploads.routes.generate_imagekit_auth_signature",
                return_value={
                    "token": "upload_token",
                    "expire": 1760000000,
                    "signature": "signed_payload",
                },
            )
        )
        cls.stack.enter_context(
            patch(
                "app.modules.payments.webhooks.razorpay_client.utility.verify_webhook_signature",
                return_value=None,
            )
        )
        cls.stack.enter_context(
            patch(
                "app.modules.payments.webhooks.PaymentRepository",
                FakePaymentRepository,
            )
        )

        cls.client = TestClient(app)

    @classmethod
    def tearDownClass(cls):
        cls.client.close()
        app.dependency_overrides.clear()
        cls.stack.close()

    def test_no_duplicate_method_path_pairs(self):
        pairs = []
        duplicates = []

        for route in app.routes:
            methods = getattr(route, "methods", set())
            for method in methods:
                if method in {"HEAD", "OPTIONS"}:
                    continue
                pair = (method, route.path)
                if pair in pairs:
                    duplicates.append(pair)
                pairs.append(pair)

        self.assertEqual(duplicates, [], f"Duplicate routes found: {duplicates}")

    def test_api_smoke_endpoints(self):
        cases = [
            ("GET", "/health", None, None, None),
            ("GET", "/openapi.json", None, None, None),
            ("GET", "/api/v1/auth/me", None, None, None),
            ("GET", "/api/v1/document-types", None, None, None),
            ("GET", "/api/v1/document-types/birth-certificate", None, None, None),
            (
                "POST",
                "/api/v1/applications",
                {
                    "document_type_id": str(DOCUMENT_TYPE_ID),
                    "proofs": [
                        {
                            "file_url": "https://example.com/proof.pdf",
                            "mime_type": "application/pdf",
                            "file_type": "AADHAAR",
                        }
                    ],
                    "remarks": "Please process soon",
                },
                None,
                None,
            ),
            ("GET", "/api/v1/applications", None, None, None),
            ("GET", f"/api/v1/applications/{APPLICATION_ID}", None, None, None),
            ("GET", "/api/v1/uploads/auth", None, None, None),
            ("GET", "/api/v1/officer/applications", None, None, None),
            (
                "POST",
                f"/api/v1/officer/applications/{APPLICATION_ID}/approve",
                {"remarks": "Approved"},
                None,
                None,
            ),
            (
                "POST",
                f"/api/v1/officer/applications/{APPLICATION_ID}/reject",
                {"remarks": "Rejected"},
                None,
                None,
            ),
            (
                "POST",
                f"/api/v1/officer/applications/{APPLICATION_ID}/issue-document",
                None,
                None,
                None,
            ),
            ("GET", "/api/v1/admin/users", None, None, None),
            ("GET", "/api/v1/admin/officers", None, None, None),
            ("GET", "/api/v1/admin/admins", None, None, None),
            ("GET", "/api/v1/admin/audit-logs", None, None, None),
            (
                "POST",
                "/api/v1/grievances",
                {
                    "subject": "Water issue",
                    "description": "No water supply in the area",
                    "category": "Water",
                },
                None,
                None,
            ),
            ("GET", "/api/v1/grievances", None, None, None),
            ("GET", f"/api/v1/grievances/{GRIEVANCE_ID}", None, None, None),
            (
                "POST",
                f"/api/v1/grievances/{GRIEVANCE_ID}/resolve",
                {"status": "RESOLVED", "resolution_notes": "Resolved quickly"},
                None,
                None,
            ),
            (
                "POST",
                "/api/v1/payments/create-order",
                {
                    "application_id": str(APPLICATION_ID),
                    "payment_type": "CERTIFICATE_FEE",
                    "amount": 100.0,
                },
                None,
                None,
            ),
            (
                "POST",
                "/api/v1/payments/verify",
                {
                    "razorpay_order_id": "order_test_123",
                    "razorpay_payment_id": "pay_test_123",
                    "razorpay_signature": "sig_test_123",
                },
                None,
                None,
            ),
            ("GET", "/api/v1/payments", None, None, None),
            (
                "POST",
                "/api/v1/webhooks/razorpay",
                {
                    "event": "payment.captured",
                    "payload": {
                        "payment": {
                            "entity": {
                                "id": "pay_test_123",
                                "order_id": "order_test_123",
                            }
                        }
                    },
                },
                {"x-razorpay-signature": "test_signature"},
                None,
            ),
            (
                "POST",
                "/api/v1/chat/sessions",
                {"title": "Support Chat"},
                None,
                None,
            ),
            ("GET", "/api/v1/chat/history", None, None, None),
            ("GET", "/api/v1/chat/messages", None, None, {"session_id": str(CHAT_SESSION_ID)}),
            (
                "POST",
                "/api/v1/chat/messages",
                {
                    "session_id": str(CHAT_SESSION_ID),
                    "message": "Hello assistant",
                },
                None,
                None,
            ),
            ("GET", "/api/v1/dashboard/summary", None, None, None),
        ]

        for method, path, payload, headers, params in cases:
            with self.subTest(method=method, path=path):
                response = self.client.request(
                    method,
                    path,
                    json=payload,
                    headers=headers,
                    params=params,
                )
                self.assertEqual(response.status_code, 200, response.text)


if __name__ == "__main__":
    unittest.main()
