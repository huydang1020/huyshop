import React, { useState, useEffect } from "react";
import { Upload, Modal, UploadFile, UploadProps, Image } from "antd";
import type { UploadRequestOption } from "rc-upload/lib/interface";
import "antd/es/modal/style";
import "antd/es/slider/style";
import { uploadImage } from "#src/services/upload.js";

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

      const resp = await uploadImage(formData);

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
        ? fileList.length <= 10 && "+ Tải lên"
        : fileList.length === 0 && "+ Tải lên"}
    </Upload>
  );

  return (
    <>
      {uploadDom}
      <Modal
        open={previewVisible}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
      >
        <img alt="example" style={{ width: "100%" }} src={previewImage} />
      </Modal>
    </>
  );
};

export default UploadImage;
