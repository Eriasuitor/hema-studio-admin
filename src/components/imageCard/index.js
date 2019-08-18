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
	InputNumber,
	Upload,
	Modal,
	Radio,
	List,
	Typography
} from 'antd';
import lodash from 'lodash'

class ImageCard extends React.Component {

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

	state = {
		previewImage: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
		previewVisible: false,
		fileList: []
	}

	getBase64(file) {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = () => resolve(reader.result);
			reader.onerror = error => reject(error);
		});
	}

	handleCancel = () => this.setState({ previewVisible: false });

	handlePreview = async file => {
		if (!file.url && !file.preview) {
			file.preview = await this.getBase64(file.originFileObj);
		}

		this.setState({
			previewImage: file.url || file.preview,
			previewVisible: true,
		});
	};

	handleChange = ({ fileList }) => {
		this.setState({ fileList })
		this.props.onChange(fileList)
	};

	render() {
		return <span>
			<Upload
				listType="picture-card"
				fileList={this.state.fileList}
				onPreview={this.handlePreview}
				beforeUpload={() => false}
				onChange={this.handleChange}
				multiple={true}
			>
				<div>
					<Icon type="plus" />
					<div className="ant-upload-text">上传</div>
				</div>
			</Upload>
			<Modal visible={this.state.previewVisible} footer={null} onCancel={this.handleCancel}>
				<img alt="example" style={{ width: '100%' }} src={this.state.previewImage} />
			</Modal>
		</span>
	}
}

export { ImageCard }