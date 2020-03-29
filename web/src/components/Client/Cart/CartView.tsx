/** @jsx jsx */
import * as React from 'react';

import { css, jsx, keyframes } from '@emotion/core';
import { faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useIntl } from 'react-intl';
import { Form, Field as FinalFormField, FieldRenderProps } from 'react-final-form';
import { useTheme } from 'emotion-theming';

import { Modal } from 'src/components/common/Modal/Modal';
import { Button } from 'src/components/common/Button/Button';
import { ModalBackground } from 'src/components/common/ModalBackground/ModalBackground';
import { ModalClose } from 'src/components/common/ModalClose/ModalClose';
import { LoaderLayout } from 'src/components/common/LoaderLayout/LoaderLayout';
import { ModalContent } from 'src/components/common/ModalContent/ModalContent';
import { FormTextField } from 'src/components/common/FormTextField/FormTextField';
import { Title } from 'src/components/common/Title/Title';
import { HelpText } from 'src/components/common/HelpText/HelpText';
import { Message } from 'src/components/common/Message/Message';
import { Subtitle } from 'src/components/common/Subtitle/Subtitle';

import { textCenterMixin } from 'src/styles/mixins';

import { ITheme } from 'src/themes';

import { calculateDiscountedPrice } from 'src/utils/number';

import { PriceText } from '../Price/Price';

import { IViewProps as IProps, IFormValues } from './CartPresenter';
import { CartItem } from './CartItem/CartItem';

const FirstStep: React.FC<IProps> = ({ isLoading, products, getProductCount, addMore, remove, goToNextStep }) => {
  const intl = useIntl();

  if (isLoading) {
    return <LoaderLayout />;
  }

  if (products.length === 0) {
    return <Title size={5}>{intl.formatMessage({ id: 'Cart.empty' })}</Title>;
  }

  const totalPrice = products.reduce(
    (acc, product) => acc + calculateDiscountedPrice(product.price, product.discount) * getProductCount(product.id),
    0,
  );

  const isAnyProductCountNotAllowed = products.some(product => product.quantity < getProductCount(product.id));

  return (
    <React.Fragment>
      <div>
        {products.map(product => (
          <CartItem
            key={product.id}
            product={product}
            count={getProductCount(product.id)}
            onAddClick={() => addMore(product)}
            onRemoveClick={() => remove(product)}
          />
        ))}
      </div>
      <Subtitle size={4}>
        {intl.formatMessage({ id: 'Cart.total' })}: <PriceText price={totalPrice} />
      </Subtitle>
      <Button
        color="is-info"
        css={css`
          display: block;
          width: 100%;
          text-transform: uppercase;
        `}
        disabled={isAnyProductCountNotAllowed}
        onClick={goToNextStep}
      >
        {intl.formatMessage({ id: 'Cart.order' })}
      </Button>
    </React.Fragment>
  );
};

const NameField = ({ input, meta }: FieldRenderProps<string>) => {
  const intl = useIntl();
  const showError = meta.touched && meta.error;
  return (
    <FormTextField
      labelProps={{
        children: intl.formatMessage({ id: 'Cart.nameInput.label' }),
      }}
      inputProps={{
        ...input,
        isDanger: showError,
        placeholder: intl.formatMessage({
          id: 'Cart.nameInput.placeholder',
        }),
        type: 'text',
      }}
      helpTextProps={{
        children: showError ? intl.formatMessage({ id: meta.error }) : undefined,
        type: 'is-danger',
      }}
    />
  );
};

const PhoneField = ({ input, meta }: FieldRenderProps<string>) => {
  const intl = useIntl();
  const showError = meta.touched && meta.error;
  return (
    <FormTextField
      labelProps={{
        children: intl.formatMessage({ id: 'Cart.phoneInput.label' }),
      }}
      inputProps={{
        ...input,
        isDanger: showError,
        placeholder: intl.formatMessage({
          id: 'Cart.phoneInput.placeholder',
        }),
        type: 'text',
      }}
      helpTextProps={{
        children: showError ? intl.formatMessage({ id: meta.error }) : undefined,
        type: 'is-danger',
      }}
    />
  );
};

const AddressField = ({ input, meta }: FieldRenderProps<string>) => {
  const intl = useIntl();
  const showError = meta.touched && meta.error;
  return (
    <FormTextField
      labelProps={{
        children: intl.formatMessage({ id: 'Cart.addressInput.label' }),
      }}
      inputProps={{
        ...input,
        isDanger: showError,
        placeholder: intl.formatMessage({
          id: 'Cart.addressInput.placeholder',
        }),
        type: 'text',
      }}
      helpTextProps={{
        children: showError ? intl.formatMessage({ id: meta.error }) : undefined,
        type: 'is-danger',
      }}
    />
  );
};

const SecondStep: React.FC<IProps> = ({ validator, initialValues, onSubmit, error }) => {
  const intl = useIntl();

  return (
    <Form<IFormValues>
      onSubmit={onSubmit}
      initialValues={initialValues as IFormValues}
      validate={validator.validate}
      render={({ handleSubmit, submitting }) => (
        <form onSubmit={handleSubmit}>
          <FinalFormField name="name" component={NameField} />
          <FinalFormField name="phone" component={PhoneField} />
          <FinalFormField name="address" component={AddressField} />
          <Button
            color="is-info"
            type="submit"
            css={css`
              display: block;
              width: 100%;
              text-transform: uppercase;
            `}
            loading={submitting}
          >
            {intl.formatMessage({ id: 'Cart.order' })}
          </Button>
          <div css={textCenterMixin}>
            {error && <HelpText type="is-danger">{intl.formatMessage({ id: error })}</HelpText>}
          </div>
        </form>
      )}
    />
  );
};

const ThirdStep: React.FC<IProps> = () => {
  const intl = useIntl();

  return (
    <Message color="is-success">
      <Message.Body>{intl.formatMessage({ id: 'Cart.orderReceived' })}</Message.Body>
    </Message>
  );
};

const bounce = keyframes`
  0%   { transform: scale(1,1)      translateY(0); }
  10%  { transform: scale(1.1,.9)   translateY(0); }
  30%  { transform: scale(.9,1.1)   translateY(-20px); }
  50%  { transform: scale(1.05,.95) translateY(0); }
  57%  { transform: scale(1,1)      translateY(-3px); }
  64%  { transform: scale(1,1)      translateY(0); }
  100% { transform: scale(1,1)      translateY(0); }
`;

export const CartView: React.FC<IProps> = props => {
  const { isOpen, open, close, step, cartItemsCount } = props;
  const theme = useTheme<ITheme>();
  return (
    <React.Fragment>
      <Button
        onClick={open}
        css={css`
          border: none !important;
        `}
      >
        <span
          css={css`
            position: relative;
            &:hover {
              color: ${theme.dark};
            }
          `}
          className="icon"
        >
          {cartItemsCount > 0 && (
            <span
              key={cartItemsCount}
              css={css`
                animation: ${bounce} 1s ease;
                position: absolute;
                width: 16px;
                height: 16px;
                font-weight: bold;
                font-size: 10px;
                top: -10px;
                right: -10px;
                background: ${theme.info};
                color: white;
                border-radius: 50%;
              `}
            >
              {cartItemsCount}
            </span>
          )}
          <FontAwesomeIcon size="lg" icon={faShoppingCart} />
        </span>
      </Button>
      <Modal isOpen={isOpen}>
        <ModalBackground onClick={close} />
        <ModalClose className="is-large" onClick={close} />

        <ModalContent
          css={css`
            padding: 1rem 2rem;
          `}
          className="has-background-light"
        >
          {step === 0 && <FirstStep {...props} />}
          {step === 1 && <SecondStep {...props} />}
          {step === 2 && <ThirdStep {...props} />}
        </ModalContent>
      </Modal>
    </React.Fragment>
  );
};
