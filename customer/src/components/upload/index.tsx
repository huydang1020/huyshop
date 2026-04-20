import React, { useState, useEffect } from "react";
import { ConfigProvider, Upload, Modal, UploadFile, UploadProps } from "antd";
import type { UploadRequestOption } from "rc-upload/lib/interface";
import "antd/es/modal/style";
import "antd/es/slider/style";
import Image from "next/image";
import { uploadImageAction } from "@/actions/upload.action";
import vi_VN from "antd/es/locale/vi_VN";

interface UploadImageProps {
  onChange?: (fileList: UploadFile[]) => void;
  action?: string;
  headers?: Record<string, string>;
  multiple?: boolean;
  value?: UploadFile[];
}

const UploadImage = (props: UploadImageProps) => {
  const { onChange: handeChange, action, headers, multiple, ...rest } = props;
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>("");

  useEffect(() => {
    if (props.value) {
      setFileList(props.value);
    }
  }, [props.value]);

  const onChange: UploadProps["onChange"] = ({ fileList: newFileList }) => {
    console.log("onChange -> newFileList", newFileList);
    setFileList(newFileList);
    if (handeChange) {
      handeChange(newFileList);
    }
  };

  const onPreview = async (file: UploadFile) => {
    setPreviewImage(file.url || file.thumbUrl || "");
    setPreviewVisible(true);
  };

  const customRequest = async (options: UploadRequestOption) => {
    const { onSuccess, onError, file } = options;

    try {
      // Create FormData from the file
      const formData = new FormData();
      formData.append("images", file as File);

      const resp = await uploadImageAction(formData);

      const arrImg: UploadFile[] = [
        {
          uid: "-1",
          name: resp.data[0],
          status: "done",
          url: resp.data[0],
        },
      ];

      if (onSuccess) {
        onSuccess(arrImg, file);
      }
    } catch (err: any) {
      console.log(`🚀 ~ file: index.tsx ~ customRequest ~ err:`, err);
      if (onError) {
        onError(err);
      }
    }
  };

  const uploadDom = (
    <ConfigProvider locale={vi_VN}>
      <Upload
        {...rest}
        multiple={multiple || false}
        action={action}
        customRequest={customRequest}
        method="put"
        headers={headers}
        listType="picture-card"
        fileList={fileList}
        onChange={onChange}
        onPreview={onPreview}
        // className={styles.myUpload}
      >
        {multiple
          ? fileList.length < 5 && "+ Tải lên"
          : fileList.length === 0 && "+ Tải lên"}
      </Upload>
    </ConfigProvider>
  );

  return (
    <>
      {uploadDom}
      <Modal
        open={previewVisible}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
      >
        <Image
          alt="example"
          style={{ width: "100%" }}
          src={previewImage}
          width={100}
          height={100}
          unoptimized
        />
      </Modal>
    </>
  );
};

export default UploadImage;
