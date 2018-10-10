from cerberus import Validator

from api.validation_rules.registration import REGISTRATION_VALIDATION_RULES


class RegistrationValidatorFactory:
    @staticmethod
    def create():
        return Validator(REGISTRATION_VALIDATION_RULES)
