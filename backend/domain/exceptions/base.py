class DomainException(Exception):
    """Base class for all domain-specific exceptions."""
    def __init__(self, message: str):
        self.message = message
        super().__init__(self.message)

class LimitReachedException(DomainException):
    """Raised when a business limit is exceeded (e.g., max 100 favorites)."""
    pass

class EntityNotFoundException(DomainException):
    """Raised when a requested business entity does not exist."""
    pass

class InvariantViolationException(DomainException):
    """Raised when a business rule or invariant is violated."""
    pass

class AlreadyExistsException(DomainException):
    """Raised when attempting to create a duplicate entity that must be unique."""
    pass
