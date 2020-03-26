from src.storage.base import Storage
from src.models import ProductImage, Product
from src.repos.base import Repo, with_session


class ProductRepo(Repo):
    def __init__(self, db_conn, file_storage: Storage):
        super().__init__(db_conn, Product)
        self.__file_storage = file_storage

    @with_session
    def add_product(
        self,
        price,
        discount,
        quantity,
        upc,
        sku,
        images,
        product_type,
        feature_values,
        session
    ):
        product = Product()

        product.price = price
        product.discount = discount
        product.quantity = quantity
        product.upc = upc
        product.sku = sku
        product.feature_values = feature_values
        product.product_type = product_type

        for image in images:
            product_image = ProductImage()
            product_image.image = self.__file_storage.save_file(image)
            product.images.append(product_image)

        session.add(product)

        # fetch images within the session for future use
        product.images

        session.flush()

        return product

    @with_session
    def update_product(
        self,
        id_,
        price,
        discount,
        quantity,
        upc,
        sku,
        images,
        product_type,
        feature_values,
        session
    ):
        product = self.get_by_id(id_, session=session)

        product.price = price
        product.discount = discount
        product.quantity = quantity
        product.upc = upc
        product.sku = sku
        product.feature_values = feature_values
        product.product_type = product_type

        new_images = []
        for image in images:
            if type(image) == str:
                new_images.append([
                    product_image
                    for product_image in product.images
                    if product_image.image == image
                ][0])
            else:
                product_image = ProductImage()
                product_image.image = self.__file_storage.save_file(image)
                new_images.append(product_image)
        product.images = new_images

        session.add(product)

        session.flush()

        return product

    @with_session
    def has_with_product_type(self, product_type_id, session):
        return session.query(Product).filter(Product.product_type_id == product_type_id).count() > 0

    @with_session
    def get_first_by_upc(self, upc, session):
        return session.query(Product).filter(Product.upc == upc).first()

    @with_session
    def get_for_product_type(self, product_type_id, session):
        return (
            session
            .query(Product)
            .filter(Product.product_type_id == product_type_id)
            .order_by(Product.id)
            .all()
        )

    class DoesNotExist(Exception):
        pass
