import { Input, Layout, Menu, Modal } from "antd";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FaCheck } from "react-icons/fa";
import "./IconPicker.css";
import IconWidget, { type TypeIconWidget } from "./IconWidget";

const { Content, Sider } = Layout;

interface IconPickerProps {
	title?: string;
	visible: boolean;
	setVisible: (val: any) => void;
	onChange: (iconIdentity: TypeIconWidget, iconType: string) => void;
}

export default function IconPicker({ title = "Chọn icon", visible, setVisible, onChange }: IconPickerProps) {
	const [isModalOpen, setIsModalOpen] = useState(visible ?? false);
	const [selectedIcon, setSelectedIcon] = useState<TypeIconWidget>("Ant");
	const [iconActive, setIconActive] = useState("");
	const [mask, setMask] = useState(false);
	const [listIcon, setListIcon] = useState(Object.keys(IconWidget[selectedIcon]).filter((i) => /^[A-Z]/.test(i)));
	const [listSearch, setListSearch] = useState(listIcon);
	const [search, setSearch] = useState("");
	const timeRef = useRef<any>();
	const maskRef = useRef<any>();

	useEffect(() => {
		setIsModalOpen(visible);
	}, [visible]);

	const clearMask = useCallback(() => {
		setMask(true);
		clearTimeout(maskRef.current);
		maskRef.current = setTimeout(() => {
			setMask(false);
		}, 1000);
	}, []);

	const items = useMemo(() => {
		return Object.keys(IconWidget).map((iconName) => ({
			key: iconName,
			label: iconName,
		}));
	}, []);

	const handleSearch = useCallback(
		(value: string) => {
			if (!value) {
				setListSearch(Object.keys(IconWidget[selectedIcon]));
				return;
			}
			const result = listIcon.filter((item) => item.toLowerCase().includes(value.toLowerCase()));
			setListSearch(result);
		},
		[listIcon, selectedIcon],
	);

	//   const showModal = useCallback(() => {
	//     setIsModalOpen(true);
	//   }, []);

	const handleOk = useCallback(() => {
		setIsModalOpen(false);
	}, []);

	const handleCancel = useCallback(() => {
		setIsModalOpen(false);
	}, []);

	const onSearch = useCallback(
		(value: string) => {
			setSearch(value);
			clearTimeout(timeRef.current);
			timeRef.current = setTimeout(() => {
				handleSearch(value);
			}, 600);
		},
		[handleSearch],
	);

	const handleMenuClick = useCallback((e: { key: TypeIconWidget }) => {
		// lấy tên icon từ key, và loại bỏ các key không phải tên icon(không bắt đầu bằng chữ cái hoa)
		const data = Object.keys(IconWidget[e.key]).filter((i) => /^[A-Z]/.test(i));
		setSearch("");
		setSelectedIcon(e.key);
		setListIcon(data);
		setListSearch(data);
	}, []);

	const handleIconClick = (iconName: string) => {
		setIconActive(iconName);
		setVisible(false);
		onChange(selectedIcon, iconName);
		clearMask();
	};

	return (
		<Modal
			width="95%"
			style={{ top: 20 }}
			title={title}
			open={isModalOpen}
			onOk={handleOk}
			onCancel={handleCancel}
			footer={null}
		>
			<Layout>
				<Sider width={170} theme="light">
					<Menu
						theme="light"
						defaultSelectedKeys={[selectedIcon]}
						mode="inline"
						items={items}
						onClick={handleMenuClick as any}
					/>
				</Sider>
				<Content style={{ backgroundColor: "#FFFFFF" }}>
					<Input
						allowClear
						onChange={(e) => onSearch(e.target.value)}
						placeholder="Tìm kiếm biểu tượng"
						value={search}
						size="large"
						style={{
							marginBottom: 12,
							marginLeft: 12,
							marginTop: 5,
							width: 240,
						}}
					/>
					<div className="icon-list">
						{listSearch.map((iconName) => {
							const isMask = mask && iconName === iconActive;
							const IconComponent = (IconWidget[selectedIcon] as any)[iconName];
							return (
								<div
									key={iconName}
									className={`icon-item ${iconName === iconActive ? "icon-item-active" : ""}`}
									onClick={() => handleIconClick(iconName)}
								>
									{isMask && (
										<div className="icon-mask">
											<FaCheck size={24} color="#1677ff" />
											<span className="icon-mask-text">Đã chọn</span>
										</div>
									)}
									<IconComponent size={24} color={iconName === iconActive ? "#1677ff" : "#555"} />
									<span className={`icon-name ${iconName === iconActive ? "icon-name-active" : ""}`}>{iconName}</span>
								</div>
							);
						})}
					</div>
				</Content>
			</Layout>
		</Modal>
	);
}
