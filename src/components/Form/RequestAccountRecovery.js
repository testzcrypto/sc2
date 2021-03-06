import React, { PropTypes } from 'react';
import { Form, Input, Button } from 'antd';
import { accountExist } from '../../utils/validator';

const FormItem = Form.Item;

class RequestAccountRecoveryForm extends React.Component {
  static propTypes = {
    form: PropTypes.shape({
      validateFieldsAndScroll: PropTypes.func,
      getFieldDecorator: PropTypes.func,
    }),
    onSubmit: PropTypes.func,
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.props.onSubmit(values);
      }
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;

    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 14 },
      },
    };
    const tailFormItemLayout = {
      wrapperCol: {
        xs: {
          span: 24,
          offset: 0,
        },
        sm: {
          span: 14,
          offset: 8,
        },
      },
    };

    return (
      <Form onSubmit={this.handleSubmit}>
        <FormItem
          {...formItemLayout}
          label="Recovery account"
          hasFeedback
        >
          {getFieldDecorator('recovery_account', {
            rules: [
              { validator: accountExist },
              { required: true, message: 'Please input the recovery account username' },
            ],
          })(
            <Input />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="Account to recover"
          hasFeedback
        >
          {getFieldDecorator('account_to_recover', {
            rules: [
              { validator: accountExist, message: 'Account name is not found' },
              { required: true, message: 'Please input the account to recover' },
            ],
          })(
            <Input />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="New password"
          help={<p>Write down your password and keep it somewhere very safe and secure.</p>}
          hasFeedback
        >
          {getFieldDecorator('new_password', {
            rules: [
              { required: true, message: 'Please input a new password' },
            ],
          })(
            <Input />
          )}
        </FormItem>
        <FormItem {...tailFormItemLayout}>
          <Button type="primary" htmlType="submit" size="large">Next</Button>
        </FormItem>
      </Form>
    );
  }
}

const RequestAccountRecovery = Form.create({
  onFieldsChange(props, changedFields) {
    props.onChange(changedFields);
  },
  mapPropsToFields(props) {
    return { ...props,
      new_password: {
        ...props.new_password,
        value: props.new_password.value,
      },
    };
  },
})(RequestAccountRecoveryForm);

export default RequestAccountRecovery;
