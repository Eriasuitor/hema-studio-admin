import React from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import store from '../../reducer/index'
import { Redirect, withRouter } from 'react-router'
import { unauthorized } from '../../reducer/actions'
import {
	PageHeader, Tag, Tabs, Button, Statistic, Table, Icon, Col, Descriptions, Drawer, Form,
	Input,
	Tooltip,
	Cascader,
	Select,
	Row,
	Checkbox,
	Divider,
	InputNumber,
	Radio,
	List,
	Typography
} from 'antd';
import lodash from 'lodash'

class InputList extends React.Component {

	formItemLayout = {
		labelCol: {
			xs: { span: 20 },
			sm: { span: 5 },
		},
		wrapperCol: {
			xs: { span: 24 },
			sm: { span: 16 },
		},
	};

	formItemLayoutWithOutLabel = {
		wrapperCol: {
			xs: { span: 24, offset: 20 },
			sm: { span: 16, offset: 5 },
		},
	};

	id = 1

	render() {
		const { id, label, placeholder, addOneTip = '添加', form, required = false, multipleInputs, rules = [], mode } = this.props
		const { setFieldsValue, getFieldDecorator, getFieldValue } = form
		// const multipleInputs = [{
		// 	id,
		// 	width: '50%',
		// 	label: '赠品',
		// 	inputComponent: <Input placeholder="赠品名称" style={{ width: '100%' }} />,
		// 	placeholder,
		// 	required,
		// 	after: '×',
		// }]
		const counter = `${id}Counter`
		getFieldDecorator(counter, { initialValue: [] });
		let keys = getFieldValue(counter);
		return (<div> {keys.map((key, index) => (
			<Form.Item
				{...(index === 0 ? this.formItemLayout : this.formItemLayoutWithOutLabel)}
				label={index === 0 ? label : ''}
				required={required}
				style={multipleInputs ? { marginBottom: 0 } : {}}
				key={`${key}`}
			>
				{
					mode === "numbers" ? <span>
						<div style={{ color: 'white', margin: '4.5px 0', display: 'flex', alignItems: 'center', padding: '4px 0 4px 8px', height: '30px', backgroundColor: 'rgb(63, 145, 247)', width: '90%', borderRadius: '4px' }}>
							{`${placeholder || ''}${index + 1}`}
						</div>
						{

							multipleInputs.map((input, subIndex) =>
								<Form.Item
									key={`${key}${subIndex}`}
									style={{ display: 'inline-block', width: input.width || '22%', marginRight: '2%' }}
								>
									{getFieldDecorator(`${id}[${key}][${input.id}]`, {
										validateTrigger: ['onChange', 'onBlur'],
										initialValue: `${input.initialValue === undefined? '': input.initialValue}`,
										getValueFromEvent: (e) => {
											if (e.currentTarget.value === '') { return e.currentTarget.value }
											if (e.currentTarget.value.includes('-')) {
												const matched = e.currentTarget.value.match(/-/g)
												if (matched && matched.length > 1) {
													return parseFloat(getFieldValue(`${id}[${key}][${input.id}]`)) || '';
												}
												if (input.min === undefined || input.min < 0) {
													return e.currentTarget.value
												} else {
													return parseFloat(getFieldValue(`${id}[${key}][${input.id}]`)) || '';
												}
											}
											if (input.precision > 0) {
												const matched = e.currentTarget.value.match(/\./g)
												if (matched && matched.length > 1) {
													return parseFloat(getFieldValue(`${id}[${key}][${input.id}]`)) || '';
												}
												if (e.currentTarget.value.endsWith('.')) { return e.currentTarget.value }
												const decimalLength = e.currentTarget.value.lastIndexOf('.')
												if (decimalLength !== -1 && decimalLength < e.currentTarget.value.length - input.precision - 1) {
													return parseFloat(getFieldValue(`${id}[${key}][${input.id}]`)) || '';
												}
											}
											if(e.currentTarget.value.match(/\.0*$/)) {
												return e.currentTarget.value
											}
											const convertedValue = parseFloat(e.currentTarget.value)
											if (isNaN(convertedValue)) {
												return parseFloat(getFieldValue(`${id}[${key}][${input.id}]`)) || '';
											} else {
												if (input.max && convertedValue > input.max || input.min && convertedValue < input.min) {
													return parseFloat(getFieldValue(`${id}[${key}][${input.id}]`)) || '';
												}
												return convertedValue;
											}
										},
										rules: [
											{
												required: true,
												message: `请输入条目${index + 1}的${input.placeholder}`,
											},
											...input.rules
										],
									})(<Input suffix={input.suffix || null} addonBefore={input.prefix || null} />)}
								</Form.Item>
							)
						}

					</span>
						: multipleInputs ? (
							<span>
								<Form.Item
									style={{ display: 'inline-block', width: '62%' }}
								>
									{getFieldDecorator(`${id}[${key}].name`, {
										validateTrigger: ['onChange', 'onBlur'],
										rules: [
											{
												required: true,
												whitespace: true,
												message: `请输入${multipleInputs[0].placeholder}${index + 1}`,
											},
											...multipleInputs[0].rules
										],
									})(<Input placeholder={`${multipleInputs[0].placeholder}${index + 1}`} />)}
								</Form.Item>
								<span style={{ margin: "0 2%" }}>×</span>
								<Form.Item style={{ display: 'inline-block', width: '22%', marginRight: '2%' }}>
									{getFieldDecorator(`${id}[${key}].amount`, {
										validateTrigger: ['onChange', 'onBlur'],
										rules: [
											{
												required: true,
												message: `请输入${multipleInputs[1].placeholder}`,
											},
											...multipleInputs[1].rules
										],
									})(<InputNumber placeholder={`${multipleInputs[1].placeholder}`} style={{ width: '100%' }} min={0} />)}
								</Form.Item></span>
						) :
							getFieldDecorator(`${id}[${key}]`, {
								validateTrigger: ['onChange', 'onBlur'],
								rules: [
									{
										required: true,
										whitespace: true,
										message: `请输入${placeholder}${index + 1}`,
									},
									...rules
								],
							})(<Input placeholder={`${placeholder}${index + 1}`} style={{ width: '90%', marginRight: 8 }} />)
				}

				<Icon
					title='删除此条目'
					className="dynamic-delete-button"
					type="minus-circle-o"
					onClick={() => {
						keys = keys.filter(_ => _ !== key)
						setFieldsValue({
							[counter]: keys
						});
					}}
				/>
			</Form.Item>
		))}
			<Form.Item
				label={keys.length === 0 ? label : ''}
				required={required}
				{...(keys.length === 0 ? this.formItemLayout : this.formItemLayoutWithOutLabel)}
			>
				<Button type="dashed" onClick={() => {
					keys.push(this.id++)
					console.log('to change 2')
					console.log(keys)
					setFieldsValue({
						[counter]: keys
					});
				}} style={{ width: '90%' }}>
					<Icon type="plus" /> {addOneTip}
				</Button>
			</Form.Item></div>)
	}
}

export { InputList }