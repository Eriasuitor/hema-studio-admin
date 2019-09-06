import React from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import store from '../../reducer/index'
import { Redirect, withRouter } from 'react-router'
import { unauthorized } from '../../reducer/actions'
import './index.css'
import {
	TimePicker, Tag, Tabs, Button, Statistic, Table, Icon, Col, Descriptions, Drawer, Form,
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
import moment from 'moment';

const { Option } = Select

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

	id = 0

	constructor(props) {
		super(props)
		if (this.props.initialValue) {
			this.id = this.props.initialValue.length
		}
		if (this.props.min) {
			this.id = this.props.min > this.id ? this.props.min : this.id
		}
	}

	diffTypeChangeEvent = {
		
	}
	// use12Hours
	diffTypeInput = {
		'number': input => <Input suffix={input.suffix || null} addonBefore={input.prefix || null} />,
		'select': input => <Select suffix={input.suffix || null} placeholder={input.placeholder}>
			{
				input.options.map(option => <Option value={option.value} key={option.value}>{option.title}</Option>)
			}	
		</Select>,
		'date': 
		input =>
		 <Input type="time" addonBefore={input.prefix || null}  style={{width: '100%'}}></Input>
		// <TimePicker suffixIcon={<span></span>} allowClear={false} format={input.format} placeholder={input.placeholder} style={{width: '100%'}}/>
	}

	render() {
		const { id, label, note, placeholder, addOneTip = '添加', form, initialValue, required = false, multipleInputs, rules = [], mode } = this.props
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
		getFieldDecorator(counter, { initialValue: lodash.range(this.id) });
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
					(() => {
						switch (mode) {
							case 'numbers':
								return <span>{
									note !== undefined ? <div style={{ color: 'white', margin: '4.5px 0', display: 'flex', alignItems: 'center', padding: '4px 8px', height: '30px', backgroundColor: 'rgb(63, 145, 247)', width: '90%', borderRadius: '4px', justifyContent: 'space-between' }}>
										<span style={{}}>{`${placeholder || ''}${index + 1}`}</span>
										<span style={{ float: 'right' }}>{note}</span>
									</div> : ""
								}
									{
										multipleInputs.map((input, subIndex) =>
											<Form.Item
												key={`${key}${subIndex}`}
												style={{ display: 'inline-block', width: input.width || '22%', marginRight: '2%' }}
											>
												{getFieldDecorator(`${id}[${key}][${input.id}]`, {
													validateTrigger: ['onChange', 'onBlur'],
													...(initialValue && initialValue[key] ? { initialValue: initialValue[key][input.id] } : ({ initialValue: input.initialValue } || {})),
													...(!input.type || input.type === 'number'? {
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
															const matched = e.currentTarget.value.match(/\./g)
															if (input.precision > 0) {
																if (matched && matched.length > 1) {
																	return parseFloat(getFieldValue(`${id}[${key}][${input.id}]`)) || '';
																}
																if (e.currentTarget.value.endsWith('.')) { return e.currentTarget.value }
																const decimalLength = e.currentTarget.value.lastIndexOf('.')
																if (decimalLength !== -1 && decimalLength < e.currentTarget.value.length - input.precision - 1) {
																	return parseFloat(getFieldValue(`${id}[${key}][${input.id}]`)) || '';
																}
															} else {
																if (matched) return parseFloat(getFieldValue(`${id}[${key}][${input.id}]`)) || '';
															}
															if (e.currentTarget.value.match(/\.0*$/)) {
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
														}
													}: (input.type === 'date'? {
														// getValueFromEvent: (e, n) => {
														// 	if(!e || !e.currentTarget) return 
														// 	let a = moment(e.currentTarget.value || undefined)
														// 	return a
														// }
													}: {})) ,
													rules: [
														{
															required: true,
															message: `请输入条目${index + 1}的${input.placeholder}`,
														},
														...input.rules
													],
												})(this.diffTypeInput[input.type || 'number'](input))}
											</Form.Item>
										)
									}

								</span>

							default:
								return multipleInputs ? (
									<span>
										<Form.Item
											style={{ display: 'inline-block', width: '62%' }}
										>
											{getFieldDecorator(`${id}[${key}].name`, {
												validateTrigger: ['onChange', 'onBlur'],
												...(initialValue && initialValue[key] ? { initialValue: initialValue[key].name } : {}),
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
												...(initialValue && initialValue[key] ? { initialValue: initialValue[key].amount } : {}),
												getValueFromEvent: (e) => {
													const value = parseInt(e.currentTarget.value)
													if (isNaN(value)) return ''
													return value
												},
												rules: [
													{
														required: true,
														message: `请输入${multipleInputs[1].placeholder}`,
													},
													...multipleInputs[1].rules
												],
											})(<Input placeholder={`${multipleInputs[1].placeholder}`} style={{ width: '100%' }} min={0} />)}
										</Form.Item></span>
								) :
									getFieldDecorator(`${id}[${key}]`, {
										validateTrigger: ['onChange', 'onBlur'],
										...(initialValue ? { initialValue: initialValue[key] } : {}),
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
					})()
				}
				{
					!this.props.min || keys.length > this.props.min ?
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
						/> : null
				}
			</Form.Item>
		))} 
			<Form.Item
				label={keys.length === 0 ? label : ''}
				required={required}
				{...(keys.length === 0 ? this.formItemLayout : this.formItemLayoutWithOutLabel)}
			>
				<Button type="dashed" onClick={() => {
					keys.push(this.id++)
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