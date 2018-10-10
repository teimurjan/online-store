from api.dto.category import CategoryDTO
from api.dto.feature_value import FeatureValueDTO
from api.dto.product import ProductDTO
from api.serializers.intl import IntlSerializer


class ProductTypeSerializer(IntlSerializer):
    def __init__(self, product_type):
        super().__init__()
        self._id = product_type.id
        self._names = product_type.names
        self._descriptions = product_type.descriptions
        self._short_descriptions = product_type.short_descriptions
        self._image = product_type.image
        self._category = product_type.category
        self._feature_values = product_type.feature_values
        self._products = product_type.products

    def serialize(self):
        return self._filter_with_only_fields({
            'id': self._id,
            'name': self._serialize_name(),
            'description': self._serialize_description(),
            'short_description': self._serialize_short_description(),
            'image': self._serialize_image(),
            'category': self._serialize_category(),
            'feature_values': self._serialize_feature_values(),
            'products': self._serialize_products()
        })

    def _serialize_name(self):
        return [name.value for name in self._names if name.language == self._language][0]

    def _serialize_description(self):
        return [
            description.value for description in self._descriptions if description.language == self._language
        ][0]

    def _serialize_short_description(self):
        return [
            short_description.value for short_description in self._short_descriptions
            if short_description.language == self._language
        ][0]

    def _serialize_image(self):
        try:
            return self._image.url
        except (AttributeError, ValueError):
            return None

    def with_serialized_category(self):
        from api.serializers.category import CategorySerializer
        if isinstance(self._category, CategoryDTO):
            self._category = CategorySerializer(self._category).serialize()
        return self

    def _serialize_category(self):
        return self._category.id if isinstance(self._category, CategoryDTO) else self._category

    def with_serialized_feature_values(self):
        from api.serializers.feature_value import FeatureValueSerializer
        self._feature_types = [
            FeatureValueSerializer(feature_type).serialize() for feature_type in self._feature_types
        ]
        return self

    def _serialize_feature_values(self):
        if len(self._feature_values) > 0 and isinstance(self._feature_values[0], FeatureValueDTO):
            return [feature_value.id for feature_value in self._feature_values]
        else:
            return self._feature_types

    def with_serialized_products(self):
        from api.serializers.product import ProductSerializer
        self._products = [
            ProductSerializer(product).serialize() for product in self._products
        ]
        return self

    def _serialize_products(self):
        if len(self._products) > 0 and isinstance(self._products[0], ProductDTO):
            return [product.id for product in self._products]
        else:
            return self._products
