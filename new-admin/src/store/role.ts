import { useMutation } from "@tanstack/react-query";
import { create } from "zustand";
import * as RoleService from "#src/services/role";
import { toastUtil } from "#src/components/toast";

type RoleStore = {
	loading: boolean;
	roles: Partial<IRole[]>;
	total: number;
	actions: {
		setLoading: (loading: boolean) => void;
		setRoles: (roles: IRole[]) => void;
		setTotal: (total: number) => void;
		clearRoles: () => void;
	};
};

const useRoleStore = create<RoleStore>()((set) => ({
	loading: false,
	roles: [],
	total: 0,
	actions: {
		setLoading: (loading) => {
			set({ loading: loading });
		},
		setRoles: (roles) => {
			set({ roles: roles });
		},
		setTotal: (total) => {
			set({ total: total });
		},
		clearRoles() {
			set({ roles: [] });
		},
	},
}));

export const useRoles = () => useRoleStore((state) => state.roles);

export const useRolesActions = () => useRoleStore((state) => state.actions);

export const useListRole = () => {
	const { setRoles, setTotal, setLoading } = useRolesActions();

	const roleMutation = useMutation({
		mutationFn: RoleService.getListRole,
	});

	const listRole = async (params?: IRoleRequest) => {
		try {
			setLoading(true);
			const res = await roleMutation.mutateAsync(params || {});
			if (res.code !== 0) {
				toastUtil.error(res.message);
				return;
			}
			const { roles, total } = res.data;
			setRoles(roles);
			setTotal(total);
			return res;
		} catch (err: any) {
			console.log("🚀 ~ listRole ~ err:", err);
			toastUtil.error(err.message);
		} finally {
			setLoading(false);
		}
	};
	return listRole;
};

export const useCreateRole = () => {
	const roleMutation = useMutation({
		mutationFn: RoleService.createRole,
	});

	const createRole = async (data: IRole) => {
		try {
			const res = await roleMutation.mutateAsync(data);
			return res;
		} catch (err: any) {
			console.log("🚀 ~ createRole ~ err:", err);
			toastUtil.error(err.message);
		}
	};

	return createRole;
};

export const useUpdateRole = () => {
	const roleMutation = useMutation({
		mutationFn: RoleService.updateRole,
	});

	const updateRole = async (data: IRole) => {
		try {
			const res = await roleMutation.mutateAsync(data);
			return res;
		} catch (err: any) {
			console.log("🚀 ~ updateRole ~ err:", err);
			toastUtil.error(err.message);
		}
	};

	return updateRole;
};

export const useDeleteRole = () => {
	const roleMutation = useMutation({
		mutationFn: RoleService.deleteRole,
	});
	const deleteRole = async (id: string) => {
		try {
			const res = await roleMutation.mutateAsync(id);
			return res;
		} catch (err: any) {
			console.log("🚀 ~ deleteRole ~ err:", err);
			toastUtil.error(err.message);
		}
	};
	return deleteRole;
};

export default useRoleStore;
