"use client";

import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import Image from "next/image";

import {
  deleteAllCartAction,
  deleteItemCartAction,
  upsertCartAction,
} from "@/actions/cart.action";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatNumber } from "@/utils/helper";
import { debounce, isEmpty } from "lodash";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { toast } from "sonner";

interface CartComponentProps {
  cartItems: ICartResponse;
}

function QuantityControl({
  item,
  onQuantityChange,
}: {
  item: IProductCartResponse;
  onQuantityChange: (productId: string, quantity: number) => void;
}) {
  const [inputValue, setInputValue] = useState(item.quantity.toString());

  useEffect(() => {
    setInputValue(item.quantity.toString());
  }, [item.quantity]);

  const debouncedUpdate = useMemo(
    () =>
      debounce((productId: string, quantity: number) => {
        if (quantity > 0) {
          onQuantityChange(productId, quantity);
        }
      }, 500),
    [onQuantityChange]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty string for user input flexibility, but only update with valid numbers
    if (value === "" || /^[1-9]\d*$/.test(value)) {
      setInputValue(value);
      const newQuantity = parseInt(value, 10);
      if (!isNaN(newQuantity) && newQuantity > 0) {
        debouncedUpdate(item.product_id, newQuantity);
      }
    }
  };

  const handleBlur = () => {
    if (inputValue === "") {
      setInputValue(item.quantity.toString());
    }
  };

  const handleIncrement = () => {
    const newQuantity = item.quantity + 1;
    if (newQuantity <= item.product.quantity) {
      setInputValue(newQuantity.toString());
      onQuantityChange(item.product_id, newQuantity);
    }
  };

  const handleDecrement = () => {
    const newQuantity = item.quantity - 1;
    if (newQuantity >= 1) {
      setInputValue(newQuantity.toString());
      debouncedUpdate(item.product_id, newQuantity);
    }
  };

  return (
    <div className="flex items-center border rounded-lg">
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={handleDecrement}
        disabled={item.quantity <= 1}
      >
        <Minus className="h-3 w-3" />
      </Button>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        className="px-1 py-1 text-sm font-medium w-full max-w-[40px] text-center bg-transparent border-0 focus:ring-0 focus:outline-none"
      />
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={handleIncrement}
        disabled={item.quantity >= item.product.quantity}
      >
        <Plus className="h-3 w-3" />
      </Button>
    </div>
  );
}

export default function CartComponent(props: CartComponentProps) {
  const { cartItems: initialCartItems } = props;
  const router = useRouter();
  const [localCartItems, setLocalCartItems] =
    useState<ICartResponse>(initialCartItems);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [selectedStores, setSelectedStores] = useState<Set<string>>(new Set());

  // Get the currently selected store (only one store can be selected at a time)
  const getSelectedStoreId = () => {
    if (selectedItems.size === 0) return null;
    const firstSelectedItem = Array.from(selectedItems)[0];
    return firstSelectedItem.split("-")[0];
  };

  useEffect(() => {
    setLocalCartItems(initialCartItems);
  }, [initialCartItems]);

  const handleUpsertCart = useCallback(
    async (productId: string, quantity: number) => {
      try {
        const resp = await upsertCartAction([
          { product_id: productId, quantity },
        ]);
        if (resp && resp.code !== 0) {
          toast.error(resp.message);
          // Revert state if API call fails
          setLocalCartItems(initialCartItems);
        } else {
          // toast.success("Giỏ hàng đã được cập nhật!");
          // Refresh server components to get the latest data
          router.refresh();
        }
      } catch (err) {
        console.error(err);
        toast.error("Có lỗi xảy ra khi cập nhật giỏ hàng.");
        setLocalCartItems(initialCartItems);
      }
    },
    [initialCartItems, router]
  );

  const handleQuantityChange = (productId: string, quantity: number) => {
    // Optimistically update the UI for quantity changes
    setLocalCartItems((prevCart) => {
      if (!prevCart) return prevCart;
      const newStores = prevCart.stores.map((store) => {
        const newProducts = store.products.map((p) =>
          p.product_id === productId ? { ...p, quantity: quantity } : p
        );
        return { ...store, products: newProducts };
      });
      return { ...prevCart, stores: newStores };
    });

    // Debounced call to the server
    handleUpsertCart(productId, quantity);
  };

  const handleDeleteItem = useCallback(
    async (productId: string, itemKey: string) => {
      const originalCartItems = localCartItems;
      const originalSelectedItems = selectedItems;

      // Optimistic UI update
      setLocalCartItems((prevCart) => {
        if (!prevCart) return prevCart;
        const newStores = prevCart.stores
          .map((store) => ({
            ...store,
            products: store.products.filter((p) => p.product_id !== productId),
          }))
          .filter((store) => store.products.length > 0);
        return { ...prevCart, stores: newStores };
      });

      setSelectedItems((prevSelected) => {
        const newSelected = new Set(prevSelected);
        newSelected.delete(itemKey);
        return newSelected;
      });

      try {
        const resp = await deleteItemCartAction(productId);
        if (resp && resp.code !== 0) {
          toast.error(resp.message);
          // Revert on failure
          setLocalCartItems(originalCartItems);
          setSelectedItems(originalSelectedItems);
        } else {
          toast.success("Đã xóa sản phẩm.");
          router.refresh();
        }
      } catch (err) {
        console.error(err);
        toast.error("Có lỗi khi xóa sản phẩm.");
        // Revert on failure
        setLocalCartItems(originalCartItems);
        setSelectedItems(originalSelectedItems);
      }
    },
    [localCartItems, selectedItems, router]
  );

  const handleDeleteAllItems = useCallback(async () => {
    const originalCartItems = localCartItems;
    // Optimistic UI update
    setLocalCartItems({ stores: [] });
    setSelectedItems(new Set());
    setSelectedStores(new Set());

    try {
      const resp = await deleteAllCartAction();
      if (resp && resp.code !== 0) {
        toast.error(resp.message);
        // Revert on failure
        setLocalCartItems(originalCartItems);
      } else {
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      toast.error("Có lỗi khi xóa giỏ hàng.");
      // Revert on failure
      setLocalCartItems(originalCartItems);
    }
  }, [localCartItems, router]);

  const handleItemSelect = (
    storeId: string,
    productId: string,
    checked: boolean
  ) => {
    const itemKey = `${storeId}-${productId}`;
    const currentSelectedStoreId = getSelectedStoreId();

    // If checking an item and there are already selected items from a different store, don't allow
    if (
      checked &&
      currentSelectedStoreId &&
      currentSelectedStoreId !== storeId
    ) {
      toast.warning("Chỉ có thể chọn sản phẩm từ cùng một cửa hàng!");
      return;
    }

    const newSelectedItems = new Set(selectedItems);

    if (checked) {
      newSelectedItems.add(itemKey);
    } else {
      newSelectedItems.delete(itemKey);
    }

    setSelectedItems(newSelectedItems);

    // Update store selection
    const storeProducts =
      localCartItems.stores.find((s) => s.id === storeId)?.products || [];
    const storeItemKeys = storeProducts.map(
      (p) => `${storeId}-${p.product_id}`
    );
    const selectedStoreItems = storeItemKeys.filter((key) =>
      newSelectedItems.has(key)
    );

    const newSelectedStores = new Set(selectedStores);
    if (selectedStoreItems.length === storeProducts.length) {
      newSelectedStores.add(storeId);
    } else {
      newSelectedStores.delete(storeId);
    }
    setSelectedStores(newSelectedStores);
  };

  const handleStoreSelect = (storeId: string, checked: boolean) => {
    const store = localCartItems.stores.find((s) => s.id === storeId);
    if (!store) return;

    const currentSelectedStoreId = getSelectedStoreId();

    // If checking a store and there are already selected items from a different store, don't allow
    if (
      checked &&
      currentSelectedStoreId &&
      currentSelectedStoreId !== storeId
    ) {
      toast.warning("Chỉ có thể chọn sản phẩm từ cùng một cửa hàng!");
      return;
    }

    const newSelectedItems = new Set(selectedItems);
    const newSelectedStores = new Set(selectedStores);

    store.products.forEach((product) => {
      const itemKey = `${storeId}-${product.product_id}`;
      if (checked) {
        newSelectedItems.add(itemKey);
        newSelectedStores.add(storeId);
      } else {
        newSelectedItems.delete(itemKey);
        newSelectedStores.delete(storeId);
      }
    });

    setSelectedItems(newSelectedItems);
    setSelectedStores(newSelectedStores);
  };

  const calculateStoreTotal = (
    store: IStore & { products: IProductCartResponse[] }
  ) => {
    return store.products.reduce((total, product) => {
      const itemKey = `${store.id}-${product.product_id}`;
      if (selectedItems.has(itemKey)) {
        return total + product.product.sell_price * product.quantity;
      }
      return total;
    }, 0);
  };

  const calculateGrandTotal = () => {
    if (!localCartItems) return 0;
    return localCartItems.stores.reduce(
      (total, store) => total + calculateStoreTotal(store),
      0
    );
  };

  const getTotalSelectedItems = () => {
    return selectedItems.size;
  };

  const getTotalItems = () => {
    return localCartItems.stores.reduce(
      (total, store) =>
        total +
        store.products.reduce(
          (storeTotal, product) => storeTotal + product.quantity,
          0
        ),
      0
    );
  };

  const handleCheckout = () => {
    // 1. Filter the cart items to get only the selected ones
    const checkoutData: ICartResponse = {
      stores: localCartItems.stores
        .map((store) => ({
          ...store,
          products: store.products.filter((product) =>
            selectedItems.has(`${store.id}-${product.product_id}`)
          ),
        }))
        .filter((store) => store.products.length > 0),
    };

    // 2. Save the data to localStorage
    localStorage.setItem("checkoutData", JSON.stringify(checkoutData));

    // 3. Navigate to the checkout page
    router.push("/thanh-toan-don-hang");
  };

  if (isEmpty(localCartItems) || localCartItems.stores.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-2 text-center">
        <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Giỏ hàng trống</h3>
        <p className="text-muted-foreground">
          Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm
        </p>
        <Button className="mt-4" onClick={() => router.push("/san-pham")}>
          Tiếp tục mua sắm
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <div className="font-medium">
              <span className="text-blue-600 font-bold">{getTotalItems()}</span>{" "}
              sản phẩm
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4" />
                  Xóa tất cả
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Bạn có chắc chắn muốn xóa toàn bộ sản phẩm khỏi giỏ hàng?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Bạn sẽ không thể khôi phục lại sau khi xóa.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAllItems}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Xác nhận
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          {localCartItems.stores.map((store) => {
            const currentSelectedStoreId = getSelectedStoreId();
            const isStoreDisabled = Boolean(
              currentSelectedStoreId && currentSelectedStoreId !== store.id
            );

            return (
              <Card key={store.id} className="overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={selectedStores.has(store.id)}
                      disabled={isStoreDisabled}
                      onCheckedChange={(checked) =>
                        handleStoreSelect(store.id, checked as boolean)
                      }
                    />
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="relative h-12 w-12 rounded-full overflow-hidden bg-gray-100">
                        <Image
                          src={store.logo || "/placeholder.svg"}
                          alt={store.name}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center">
                          <h3 className="font-semibold text-lg line-clamp-1">
                            {store.name}
                          </h3>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    {store.products.map((item) => {
                      const itemKey = `${store.id}-${item.product_id}`;
                      const isSelected = selectedItems.has(itemKey);
                      const isItemDisabled = Boolean(
                        currentSelectedStoreId &&
                          currentSelectedStoreId !== store.id
                      );

                      return (
                        <div
                          key={item.product_id}
                          className="flex gap-4 p-4 border rounded-lg"
                        >
                          <Checkbox
                            checked={isSelected}
                            disabled={isItemDisabled}
                            onCheckedChange={(checked) =>
                              handleItemSelect(
                                store.id,
                                item.product_id,
                                checked as boolean
                              )
                            }
                          />

                          <div className="relative h-20 w-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            <Image
                              src={item.product.image || "/placeholder.svg"}
                              alt={item.product.name}
                              fill
                              unoptimized
                              className="object-cover"
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-base mb-2 line-clamp-2 break-words">
                              {item.product.name}
                            </h4>

                            {(() => {
                              const attributeString = item.product
                                ?.attribute_values
                                ? Object.entries(item.product.attribute_values)
                                    .map(([key, value]) => `${key}: ${value}`)
                                    .join(" | ")
                                : "";
                              return (
                                <p className="m-0 text-sm text-muted-foreground break-words">
                                  {attributeString}
                                </p>
                              );
                            })()}

                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-base text-red-600">
                                  {formatCurrency(item.product.sell_price)}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <QuantityControl
                                  item={item}
                                  onQuantityChange={handleQuantityChange}
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                  onClick={() =>
                                    handleDeleteItem(item.product_id, itemKey)
                                  }
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            <div className="text-xs text-muted-foreground mt-1">
                              Còn lại: {formatNumber(item.product.quantity)} sản
                              phẩm
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Store Total */}
                  {calculateStoreTotal(store) > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Tổng cửa hàng:</span>
                        <span className="font-semibold text-lg text-primary">
                          {formatCurrency(calculateStoreTotal(store))}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-20 h-fit">
            <CardHeader>
              <span className="text-lg font-semibold">Tóm tắt đơn hàng</span>
            </CardHeader>
            <CardDescription className="text-sm text-muted-foreground pl-6 mb-4">
              Lưu ý: Chỉ có thể chọn sản phẩm từ cùng một cửa hàng
            </CardDescription>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Sản phẩm đã chọn:</span>
                <span>{getTotalSelectedItems()}</span>
              </div>

              <Separator />

              <div className="flex justify-between items-center">
                <span className="font-medium">Tổng cộng:</span>
                <span className="font-bold text-xl text-primary">
                  {formatCurrency(calculateGrandTotal())}
                </span>
              </div>

              <Button
                className="w-full"
                size="lg"
                disabled={selectedItems.size === 0}
                onClick={handleCheckout}
              >
                Thanh toán ({getTotalSelectedItems()})
              </Button>

              <div className="text-xs text-muted-foreground text-center">
                Bằng việc đặt hàng, bạn đồng ý với{" "}
                <a href="#" className="text-primary hover:underline">
                  Điều khoản dịch vụ
                </a>{" "}
                của chúng tôi
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
