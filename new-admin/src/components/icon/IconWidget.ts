import * as antd from "@ant-design/icons";
import * as Ant from "react-icons/ai";
import * as Bootstrap from "react-icons/bs";
import * as BoxIcons from "react-icons/bi";
import * as Circum from "react-icons/ci";
import * as CgIcons from "react-icons/cg";
import * as Devicons from "react-icons/di";
import * as Feather from "react-icons/fi";
import * as FlatColor from "react-icons/fc";
import * as FontAwesome5 from "react-icons/fa";
import * as FontAwesome6 from "react-icons/fa6";
// import * as GameIcons from "react-icons/gi";
import * as GithubOcticons from "react-icons/go";
import * as Grommet from "react-icons/gr";
import * as Ionicons4 from "react-icons/io";
import * as Ionicons5 from "react-icons/io5";
import * as MaterialDesign from "react-icons/md";
// import * as Simple from "react-icons/si";
import * as Typicons from "react-icons/ti";
import * as Weather from "react-icons/wi";

const IconWidget = {
	antd,
	Ant,
	Bootstrap,
	BoxIcons,
	Circum,
	CgIcons,
	Devicons,
	Feather,
	FlatColor,
	FontAwesome5,
	FontAwesome6,
	// GameIcons,
	GithubOcticons,
	Grommet,
	Ionicons4,
	Ionicons5,
	MaterialDesign,
	// Simple,
	Typicons,
	Weather,
};

export type TypeIconWidget = keyof typeof IconWidget;

export default IconWidget;
