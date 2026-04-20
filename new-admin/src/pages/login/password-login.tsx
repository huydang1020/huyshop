import { PASSWORD_RULES, USERNAME_RULES } from "#src/constants";

import { Button, Form, Input, Space } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useSignIn } from "#src/store/auth.js";

const FORM_INITIAL_VALUES = {
	username: "root",
	password: "1",
};
export type PasswordLoginFormType = typeof FORM_INITIAL_VALUES;

export function PasswordLogin() {
	const [loading, setLoading] = useState(false);
	const [passwordLoginForm] = Form.useForm();
	const { t } = useTranslation();
	const login = useSignIn();

	const handleFinish = async (values: PasswordLoginFormType) => {
		try {
			setLoading(true);
			await login(values);
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<Space direction="vertical">
				<h2 className="text-colorText mb-3 text-3xl font-bold leading-9 tracking-tight lg:text-4xl">
					{t("authority.welcomeBack")}
					&nbsp; 👏
				</h2>
				<p className="lg:text-base text-sm text-colorTextSecondary">
					{t("authority.loginDescription")}
				</p>
			</Space>

			<Form
				name="passwordLoginForm"
				form={passwordLoginForm}
				layout="vertical"
				initialValues={FORM_INITIAL_VALUES}
				onFinish={handleFinish}
			>
				<Form.Item
					label={t("authority.username")}
					name="username"
					rules={USERNAME_RULES(t)}
				>
					<Input placeholder={t("form.username.required")} />
				</Form.Item>

				<Form.Item
					label={t("authority.password")}
					name="password"
					rules={PASSWORD_RULES(t)}
				>
					<Input.Password placeholder={t("form.password.required")} />
				</Form.Item>

				<Form.Item>
					<Button block type="primary" htmlType="submit" loading={loading}>
						{t("authority.login")}
					</Button>
				</Form.Item>
			</Form>
		</>
	);
}
