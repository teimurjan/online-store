class FeatureValueService:
    def __init__(self, repo, name_repo, language_repo, feature_type_repo):
        self._repo = repo
        self._name_repo = name_repo
        self._language_repo = language_repo
        self._feature_type_repo = feature_type_repo

    def create(self, data):
        try:
            languages = self._language_repo.get_all()
            if [l.id for l in languages] != [n['language_id'] for n in data['names']]:
                raise self.LanguageInvalid()

            feature_type = self._feature_type_repo.get_by_id(
                data['feature_type_id']
            )
            feature_value = self._repo.create(feature_type_id=feature_type.id)
            for name in data['names']:
                self._name_repo.create(
                    language_id=name['language_id'],
                    value=name['value'],
                    feature_value_id=feature_value.id
                )
            return feature_value
        except self._feature_type_repo.DoesNotExist:
            raise self.FeatureTypeInvalid()

    def get_all(self):
        return self._repo.get_all()

    class FeatureValueNotFound(Exception):
        pass

    class FeatureTypeInvalid(Exception):
        pass

    class LanguageInvalid(Exception):
        pass
