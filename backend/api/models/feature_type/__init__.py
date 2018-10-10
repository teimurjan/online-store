from django.db import models

from api.dto.feature_type import FeatureTypeDTO
from api.models.category import Category
from api.models.product_type import ProductType
from api.models.product import Product
from api.models.intl import IntlText


class FeatureType(models.Model):
    categories = models.ManyToManyField(Category, related_name='feature_types',
                                        related_query_name='feature_type', db_table='api_feature_type_x_category')

    def to_dto(self):
        names = [name.to_dto() for name in self.names]
        categories = [category.to_dto() for category in self.categories]
        feature_values = [
            feature_value.to_dto() for feature_value in self.feature_values
        ]
        return FeatureTypeDTO(self.pk, names, categories, feature_values)

    class Meta:
        db_table = 'api_feature_type'
