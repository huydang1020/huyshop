import { Editor } from "@tinymce/tinymce-react";
import React, { useEffect, useState } from "react";

const RichText: React.FC<{
  value?: any;
  onChange?: (val: any) => void;
  style?: Record<string, any>;
  [x: string]: any;
  height?: number;
}> = ({ value, onChange, height }) => {
  const [text, setText] = useState(value || "");

  useEffect(() => {
    setText(value || "");
  }, [value]);

  const onEditorChange = React.useCallback((e: any) => {
    const val = e;
    setText(val);
    if (onChange) {
      onChange(val);
    }
  }, []);

  return (
    <Editor
      apiKey="dimrz6ebn5yruo243vqhvognvqvfszjrmcvqvmq9wp12o6hu"
      value={text}
      init={{
        height: height || 300,
        plugins: [
          "autolink",
          "lists",
          "link",
          "charmap",
          "preview",
          "anchor",
          "searchreplace",
          "fullscreen",
        ],
        toolbar:
          "insertfile undo redo | styleselect forecolor backcolor | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | code",
        extended_valid_elements: "span[id|style|class]",
        content_style:
          "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
        // automatic_uploads: false,
        convert_urls: false,
        noneditable_noneditable_class: "mceNonEditable",
      }}
      onEditorChange={onEditorChange}
    />
  );
};

export default RichText;
