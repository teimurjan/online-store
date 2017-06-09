import abc

from django.db import IntegrityError
from django.http import JsonResponse

from api.utils.error_constants import *
from api.utils.form_fields_constants import *
from api.utils.response_constants import *
from api.validators import RegistrationFormValidator, LoginFormValidator, ProductFormValidator
from main import settings
from store.models import *
import jwt
import bcrypt


def generate_token(user):
  payload = {ID_JSON_KEY: user.pk, NAME_JSON_KEY: user.name, GROUP_JSON_KEY: user.group.name}
  return jwt.encode(payload, settings.SECRET_KEY).decode()


def base64_to_image(data, file_name):
  import base64
  from django.core.files.base import ContentFile
  format, img_base64 = data.split(';base64,')
  type = format.split('/')[-1]
  return ContentFile(base64.b64decode(img_base64), name=file_name + '.' + type)


class BaseSerializer:
  def __init__(self, data=None):
    if data:
      self.data = data


class Serializer(BaseSerializer):
  @abc.abstractmethod
  def create(self):
    return

  @abc.abstractmethod
  def read(self):
    return

  @abc.abstractmethod
  def update(self):
    return

  @abc.abstractmethod
  def delete(self):
    return


class AuthSerializer(BaseSerializer):
  def register(self):
    name = self.data[NAME_FIELD]
    email = self.data[EMAIL_FIELD]
    password = self.data[PASSWORD_FIELD]
    hashed_password = bcrypt.hashpw(password.encode(), bcrypt.gensalt())
    group, created = Group.objects.get_or_create(name='reader')
    try:
      user = User.objects.create(name=name, email=email, password=hashed_password, group=group)
      return JsonResponse({TOKEN_JSON_KEY: generate_token(user)})
    except IntegrityError:
      return JsonResponse({EMAIL_FIELD: [SAME_EMAIL_ERR]}, status=411)

  def login(self):
    email = self.data[EMAIL_FIELD]
    password = self.data[PASSWORD_FIELD]
    user = User.objects.get(email=email)
    is_valid_password = bcrypt.checkpw(password.encode(), user.password.encode())
    if is_valid_password:
      return JsonResponse({TOKEN_JSON_KEY: generate_token(user)})
    else:
      return JsonResponse({PASSWORD_FIELD: [PASSWORD_DOESNT_MATCH_ERR]}, status=411)


class UserSerializer(Serializer):
  def create(self):
    pass

  def read(self):
    pass

  def update(self):
    pass

  def delete(self):
    user_id = self.data[ID_FIELD]
    try:
      User.objects.get(pk=user_id).delete()
      return JsonResponse(MESSAGE_OK)
    except User.DoesNotExist:
      return JsonResponse({GLOBAL_ERR_KEY: [NO_SUCH_USER_ERR]}, status=404)


class UserListSerializer(Serializer):
  def delete(self):
    pass

  def create(self):
    pass

  def update(self):
    pass

  def read(self):
    response = {DATA_JSON_KEY: []}
    for user in User.objects.all():
      response[DATA_JSON_KEY].append(user.to_dict())
    return JsonResponse(response)


class CategoryListSerializer(Serializer):
  def read(self):
    response = {DATA_JSON_KEY: []}
    categories = Category.objects.all()
    for category in categories:
      response[DATA_JSON_KEY].append({ID_JSON_KEY: category.pk, NAME_JSON_KEY: category.name})
    return JsonResponse(response)

  def update(self):
    pass

  def create(self):
    name = self.data['name']
    try:
      category = Category.objects.create(name=name)
      return JsonResponse(category.to_dict())
    except IntegrityError:
      return JsonResponse({NAME_FIELD: [SAME_GROUP_NAME_ERR]}, status=411)

  def delete(self):
    pass


class CategorySerializer(Serializer):
  def delete(self):
    pass

  def create(self):
    pass

  def update(self):
    pass

  def read(self):
    category_id = self.data[ID_FIELD]
    try:
      category = Category.objects.get(pk=category_id)
      return JsonResponse({ID_JSON_KEY: category.pk, NAME_JSON_KEY: category.name})
    except Category.DoesNotExist:
      return JsonResponse({GLOBAL_ERR_KEY: [NO_SUCH_CATEGORY_ERR]}, status=404)


class ProductListSerializer(Serializer):
  def delete(self):
    pass

  def create(self):
    name = self.data[NAME_FIELD]
    description = self.data[DESCRIPTION_FIELD]
    discount = self.data[DISCOUNT_FIELD]
    quantity = self.data[QUANTITY_FIELD]
    image = self.data[IMAGE_FIELD]
    price = self.data[PRICE_FIELD]
    category_id = self.data[CATEGORY_FIELD]
    try:
      base64_to_image(image, name)
    except Exception:
      return JsonResponse({IMAGE_FIELD: NOT_VALID_IMAGE})
    product = Product.objects.create(
      name=name,
      image=image,
      discount=discount,
      description=description,
      quantity=quantity,
      price=price,
      category_id=category_id
    )
    return JsonResponse(product.to_dict())

  def update(self):
    pass

  def read(self):
    response = {DATA_JSON_KEY: []}
    category_id = self.data[ID_JSON_KEY]
    if category_id:
      products = Product.objects.filter(category_id=category_id)
    else:
      products = Product.objects.all()
    for product in products:
      response[DATA_JSON_KEY].append(product.to_dict())
    return JsonResponse(response)


class ProductSerializer(Serializer):
  def delete(self):
    pass

  def create(self):
    pass

  def update(self):
    pass

  def read(self):
    product_id = self.data[ID_FIELD]
    try:
      product = Product.objects.get(pk=product_id)
      return JsonResponse(product.to_dict())
    except Product.DoesNotExist:
      return JsonResponse({GLOBAL_ERR_KEY: [NO_SUCH_PRODUCT_ERR]})
