import { request } from "../utils";

const url = "role";

const getListRole = (data: IRoleRequest) => {
	return request
		.get<
			IApiResponse<IRoleResponse>
		>(url, { searchParams: { ...data }, ignoreLoading: true })
		.json();
};

const createRole = (data: IRole) => {
	return request
		.post<IApiResponse<IRole>>(url, { json: data, ignoreLoading: true })
		.json();
};

const updateRole = (data: IRole) => {
	return request
		.put<
			IApiResponse<IRole>
		>(`${url}/${data.id}`, { json: data, ignoreLoading: true })
		.json();
};

const deleteRole = (id: string) => {
	return request
		.delete<IApiResponse<IRole>>(`${url}/${id}`, { ignoreLoading: true })
		.json();
};

export { getListRole, createRole, updateRole, deleteRole };
