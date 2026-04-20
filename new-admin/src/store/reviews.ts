import { useMutation } from "@tanstack/react-query";
import { create } from "zustand";
import { toastUtil } from "../components/toast";
import { IOrder, IOrderRequest } from "#src/types/order.js";
import * as reviewsService from "#src/services/reviews";
import { IReviews, IReviewsRequest } from "#src/types/reviews.js";

type ReviewsStore = {
  loading: boolean;
  reviews: IReviews[];
  total: number;
  actions: {
    setLoading: (loading: boolean) => void;
    setReviews: (reviews: IReviews[]) => void;
    setTotal: (total: number) => void;
    clearReviews: () => void;
  };
};

const useReviewsStore = create<ReviewsStore>()((set) => ({
  loading: false,
  reviews: [],
  total: 0,
  actions: {
    setLoading: (loading) => {
      set({ loading: loading });
    },
    setReviews: (reviews) => {
      set({ reviews });
    },
    setTotal: (total) => {
      set({ total });
    },
    clearReviews() {
      set({ reviews: [] });
    },
  },
}));

export const useReviews = () => useReviewsStore((state) => state.reviews);
export const useReviewsActions = () =>
  useReviewsStore((state) => state.actions);

export const useListReviews = () => {
  const { setReviews, setTotal, setLoading } = useReviewsActions();

  const reviewsMutation = useMutation({
    mutationFn: reviewsService.getListReviews,
  });

  const listReviews = async (params?: IReviewsRequest) => {
    try {
      setLoading(true);
      const res = await reviewsMutation.mutateAsync(params || {});
      if (res.code !== 0) {
        toastUtil.error(res.message);
        return;
      }
      const { reviews, total } = res.data;
      setReviews(reviews);
      setTotal(total);
      return res;
    } catch (err: any) {
      console.log("🚀 ~ listReviews ~ err:", err);
      toastUtil.error(err.message);
    } finally {
      setLoading(false);
    }
  };
  return listReviews;
};

export const useUpdateReviews = () => {
  const reviewsMutation = useMutation({
    mutationFn: reviewsService.updateReviews,
  });

  const updateReviews = async (data: IReviews) => {
    try {
      const res = await reviewsMutation.mutateAsync(data);
      if (res.code !== 0) {
        toastUtil.error(res.message);
        return;
      }
      toastUtil.success("Cập nhật phản hồi thành công");
      return res;
    } catch (err: any) {
      console.log("🚀 ~ updateReviews ~ err:", err);
      toastUtil.error(err.message);
    }
  };

  return updateReviews;
};

export default useReviewsStore;
