import IconWidget, { TypeIconWidget } from "./IconWidget";

export interface RenderIconProps {
  icon: {
    icon_name: string;
    icon_type: TypeIconWidget;
  };
  style?: any;
}

const RenderIcon = ({ icon, style }: RenderIconProps) => {
  if (!icon || !icon.icon_type || !IconWidget[icon.icon_type]) return null;
  const Icon = (IconWidget[icon.icon_type] as any)[icon.icon_name];
  return <Icon style={style} />;
};

export default RenderIcon;
