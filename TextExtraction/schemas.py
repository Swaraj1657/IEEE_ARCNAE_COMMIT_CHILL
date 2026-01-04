"""
Pydantic schemas for certificate extraction and database operations.
Handles validation and transformation of LLM-extracted certificate data.
"""

from pydantic import BaseModel, Field, field_validator, model_validator
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum


# =========================
# ENUMS
# =========================
class DocumentType(str, Enum):
    """Certificate document types."""
    DEGREE = "DEGREE"
    MARKSHEET = "MARKSHEET"
    INTERNSHIP = "INTERNSHIP"
    COURSE = "COURSE"
    OTHER = "OTHER"


class OrganizationType(str, Enum):
    """Organization types."""
    COLLEGE = "COLLEGE"
    UNIVERSITY = "UNIVERSITY"
    INSTITUTE = "INSTITUTE"
    SCHOOL = "SCHOOL"
    ACADEMY = "ACADEMY"
    BOARD = "BOARD"
    ONLINE_PLATFORM = "ONLINE_PLATFORM"
    OTHER = "OTHER"


class VerificationStatus(str, Enum):
    """Verification status of certificate."""
    PENDING = "PENDING"
    VERIFIED = "VERIFIED"
    PARTIALLY_VERIFIED = "PARTIALLY_VERIFIED"
    FAILED = "FAILED"


# =========================
# VISUAL ELEMENTS SCHEMA
# =========================
class VisualElements(BaseModel):
    """Extracted visual elements from certificate."""
    
    institution_logo_embedded: Optional[bool] = Field(
        default=False,
        description="Whether institution logo is present in certificate"
    )
    aishe_code: Optional[str] = Field(
        default=None,
        description="AISHE (All India Survey on Higher Education) code"
    )
    clip_embedding: Optional[List[float]] = Field(
        default=None,
        description="CLIP embedding vector for visual content"
    )
    signature_detected: Optional[bool] = Field(
        default=False,
        description="Whether signature is detected in certificate"
    )
    watermark_detected: Optional[bool] = Field(
        default=False,
        description="Whether watermark/security features are detected"
    )
    qr_code_present: Optional[bool] = Field(
        default=False,
        description="Whether QR code is present"
    )
    
    class Config:
        use_enum_values = True


# =========================
# LLM EXTRACTED CERTIFICATE SCHEMA
# =========================
class LLMExtractedCertificate(BaseModel):
    """Schema for LLM-extracted certificate data."""
    
    # ===== STUDENT INFORMATION =====
    student_name: Optional[str] = Field(
        default=None,
        description="Full name of student"
    )
    roll_number: Optional[str] = Field(
        default=None,
        description="Student roll/registration number"
    )
    registration_number: Optional[str] = Field(
        default=None,
        description="Student registration number"
    )
    apaar_id: Optional[str] = Field(
        default=None,
        description="APAAR (Automated Permanent Academic Account Registry) ID"
    )
    
    # ===== PARENT INFORMATION =====
    father_name: Optional[str] = Field(
        default=None,
        description="Father's name"
    )
    mother_name: Optional[str] = Field(
        default=None,
        description="Mother's name"
    )
    
    # ===== ACADEMIC INFORMATION =====
    degree: Optional[str] = Field(
        default=None,
        description="Degree awarded (e.g., B.Tech, M.Tech, B.Sc)"
    )
    branch: Optional[str] = Field(
        default=None,
        description="Branch/Stream (e.g., Computer Science, Electronics)"
    )
    semester: Optional[str] = Field(
        default=None,
        description="Semester/Year of completion"
    )
    examination: Optional[str] = Field(
        default=None,
        description="Type of examination (e.g., Final, Semester)"
    )
    
    # ===== TEMPORAL INFORMATION =====
    issued_date: Optional[str] = Field(
        default=None,
        description="Date certificate was issued (YYYY-MM-DD format)"
    )
    
    # ===== INSTITUTION INFORMATION =====
    institution_name: Optional[str] = Field(
        default=None,
        description="Name of issuing institution"
    )
    organization_type: Optional[OrganizationType] = Field(
        default=None,
        description="Type of organization (college, university, etc.)"
    )
    
    # ===== VISUAL ELEMENTS =====
    extracted_visuals: Optional[VisualElements] = Field(
        default=None,
        description="Extracted visual elements from certificate"
    )
    
    # ===== METADATA =====
    confidence_score: Optional[float] = Field(
        default=0.0,
        ge=0.0,
        le=1.0,
        description="LLM confidence score for extraction (0-1)"
    )
    extraction_notes: Optional[str] = Field(
        default=None,
        description="Additional notes from extraction process"
    )
    
    @field_validator('issued_date')
    @classmethod
    def validate_date(cls, v):
        """Validate date format."""
        if v:
            # Try to parse the date
            try:
                datetime.strptime(v, '%Y-%m-%d')
            except ValueError:
                # Try alternative formats
                try:
                    datetime.strptime(v, '%d-%m-%Y')
                except ValueError:
                    raise ValueError(f"Invalid date format: {v}. Use YYYY-MM-DD or DD-MM-YYYY")
        return v
    
    @field_validator('roll_number', 'registration_number', 'apaar_id')
    @classmethod
    def clean_whitespace(cls, v):
        """Remove extra whitespace from identification numbers."""
        if v:
            return v.strip().upper()
        return v
    
    @field_validator('student_name', 'father_name', 'mother_name', 'institution_name', 'degree', 'branch')
    @classmethod
    def clean_names(cls, v):
        """Clean and normalize name fields."""
        if v:
            # Remove extra whitespace and convert to title case
            return " ".join(v.split()).title()
        return v
    
    class Config:
        use_enum_values = True
        json_schema_extra = {
            "example": {
                "student_name": "John Doe",
                "roll_number": "ENG001",
                "degree": "B.Tech",
                "branch": "Computer Science",
                "institution_name": "ABC University",
                "issued_date": "2024-06-15",
                "confidence_score": 0.95
            }
        }


# =========================
# DATABASE INSERT SCHEMA
# =========================
class CertificateDBInsert(BaseModel):
    """Schema for inserting certificate data into database."""
    
    # ===== OWNERSHIP & METADATA =====
    owner_id: str = Field(
        ...,
        description="UUID of certificate owner"
    )
    document_type: DocumentType = Field(
        default=DocumentType.DEGREE,
        description="Type of document"
    )
    certificate_link: Optional[str] = Field(
        default=None,
        description="Storage path to certificate file"
    )
    
    # ===== EXTRACTED STUDENT INFO =====
    extracted_student_name: Optional[str] = Field(
        default=None,
        description="Extracted student name"
    )
    extracted_roll_number: Optional[str] = Field(
        default=None,
        description="Extracted roll number"
    )
    extracted_registration_number: Optional[str] = Field(
        default=None,
        description="Extracted registration number"
    )
    extracted_apaar_id: Optional[str] = Field(
        default=None,
        description="Extracted APAAR ID"
    )
    
    # ===== EXTRACTED PARENT INFO =====
    extracted_father_name: Optional[str] = Field(
        default=None,
        description="Extracted father's name"
    )
    extracted_mother_name: Optional[str] = Field(
        default=None,
        description="Extracted mother's name"
    )
    
    # ===== EXTRACTED ACADEMIC INFO =====
    extracted_degree: Optional[str] = Field(
        default=None,
        description="Extracted degree"
    )
    extracted_branch: Optional[str] = Field(
        default=None,
        description="Extracted branch"
    )
    extracted_semester: Optional[str] = Field(
        default=None,
        description="Extracted semester"
    )
    extracted_examination: Optional[str] = Field(
        default=None,
        description="Extracted examination type"
    )
    
    # ===== TEMPORAL INFO =====
    issued_date: Optional[str] = Field(
        default=None,
        description="Date certificate was issued"
    )
    
    # ===== INSTITUTION INFO =====
    extracted_institution_name: Optional[str] = Field(
        default=None,
        description="Extracted institution name"
    )
    extracted_organization_type: Optional[str] = Field(
        default=None,
        description="Extracted organization type"
    )
    
    # ===== VISUAL & RAW DATA =====
    extracted_visuals: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Extracted visual elements as JSON"
    )
    raw_extracted_data: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Complete raw LLM output"
    )
    
    # ===== VERIFICATION INFO =====
    verification_source: Optional[str] = Field(
        default=None,
        description="Source of verification (e.g., College-ALL COLLEGE.xlsx)"
    )
    verification_status: Optional[VerificationStatus] = Field(
        default=VerificationStatus.PENDING,
        description="Verification status"
    )
    forgery_risk_score: Optional[float] = Field(
        default=None,
        ge=0.0,
        le=100.0,
        description="Forgery risk score (0-100)"
    )
    verdict: Optional[str] = Field(
        default=None,
        description="Verification verdict/conclusion"
    )
    
    class Config:
        use_enum_values = True
        json_schema_extra = {
            "example": {
                "owner_id": "user-uuid-123",
                "document_type": "DEGREE",
                "extracted_student_name": "John Doe",
                "extracted_institution_name": "ABC University",
                "verification_status": "PENDING",
                "forgery_risk_score": 5.0
            }
        }
    
    @staticmethod
    def from_llm_data(
        user_id: str,
        llm_data: LLMExtractedCertificate,
        document_type: DocumentType = DocumentType.DEGREE,
        certificate_link: Optional[str] = None
    ) -> "CertificateDBInsert":
        """
        Create a database insert record from LLM extracted data.
        
        Args:
            user_id: UUID of certificate owner
            llm_data: LLMExtractedCertificate instance
            document_type: Type of document
            certificate_link: Storage path to certificate
            
        Returns:
            CertificateDBInsert: Ready to insert into database
            
        Example:
            >>> llm_json = {"student_name": "John Doe", ...}
            >>> llm_data = LLMExtractedCertificate.model_validate(llm_json)
            >>> db_row = CertificateDBInsert.from_llm_data(
            ...     user_id="user-123",
            ...     llm_data=llm_data,
            ...     document_type=DocumentType.DEGREE
            ... )
        """
        return CertificateDBInsert(
            owner_id=user_id,
            document_type=document_type,
            certificate_link=certificate_link,
            
            # Student info
            extracted_student_name=llm_data.student_name,
            extracted_roll_number=llm_data.roll_number,
            extracted_registration_number=llm_data.registration_number,
            extracted_apaar_id=llm_data.apaar_id,
            
            # Parent info
            extracted_father_name=llm_data.father_name,
            extracted_mother_name=llm_data.mother_name,
            
            # Academic info
            extracted_degree=llm_data.degree,
            extracted_branch=llm_data.branch,
            extracted_semester=llm_data.semester,
            extracted_examination=llm_data.examination,
            
            # Temporal info
            issued_date=llm_data.issued_date,
            
            # Institution info
            extracted_institution_name=llm_data.institution_name,
            extracted_organization_type=llm_data.organization_type.value 
                if llm_data.organization_type else None,
            
            # Visual & raw data
            extracted_visuals=llm_data.extracted_visuals.model_dump() 
                if llm_data.extracted_visuals else None,
            raw_extracted_data=llm_data.model_dump(),
            
            # Default verification status
            verification_status=VerificationStatus.PENDING
        )


# =========================
# VERIFICATION RESPONSE SCHEMA
# =========================
class VerificationResult(BaseModel):
    """Schema for verification results."""
    
    verified: bool = Field(
        ...,
        description="Whether certificate is verified"
    )
    status: str = Field(
        ...,
        description="Verification status code"
    )
    risk_level: Optional[str] = Field(
        default="LOW",
        description="Risk level (LOW, MEDIUM, HIGH)"
    )
    confidence_score: Optional[float] = Field(
        default=0.0,
        ge=0.0,
        le=1.0,
        description="Confidence score"
    )
    matched_institute: Optional[str] = Field(
        default=None,
        description="Matched institution name from database"
    )
    message: Optional[str] = Field(
        default=None,
        description="Human-readable message"
    )
    
    class Config:
        use_enum_values = True


# =========================
# BATCH PROCESSING SCHEMA
# =========================
class CertificateBatchInsert(BaseModel):
    """Schema for batch inserting certificates."""
    
    certificates: List[CertificateDBInsert] = Field(
        ...,
        description="List of certificates to insert"
    )
    batch_id: Optional[str] = Field(
        default=None,
        description="Optional batch identifier"
    )
    processed_at: Optional[datetime] = Field(
        default_factory=datetime.utcnow,
        description="Timestamp of batch processing"
    )
