"use client";

import React, { useState } from "react";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  MessageSquare,
  User,
  Building,
  CheckCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

const ContactComponent = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    subject: "",
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      subject: value,
    }));
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    // Simulate form submission
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        subject: "",
        message: "",
      });
    }, 3000);
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: "Địa Chỉ",
      content: ["123 Phố Huế, Quận Hai Bà Trưng", "Hà Nội, Việt Nam"],
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      icon: Phone,
      title: "Điện Thoại",
      content: ["Hotline: 0901 234 567", "Tư vấn: 0912 345 678"],
      bgColor: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      icon: Mail,
      title: "Email",
      content: ["info@yourstore.vn", "support@yourstore.vn"],
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      icon: Clock,
      title: "Giờ Làm Việc",
      content: ["Thứ 2 - Thứ 6: 8:00 - 18:00", "Thứ 7 - CN: 9:00 - 17:00"],
      bgColor: "bg-orange-100",
      iconColor: "text-orange-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Liên Hệ Với Chúng Tôi
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Chúng tôi luôn sẵn sàng hỗ trợ bạn. Hãy liên hệ để được tư vấn tốt
              nhất!
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-gray-100">
              <CardHeader>
                <CardTitle className="text-2xl">Thông Tin Liên Hệ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {contactInfo.map((item, index) => {
                  const IconComponent = item.icon;
                  return (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div
                          className={`w-12 h-12 ${item.bgColor} rounded-full flex items-center justify-center`}
                        >
                          <IconComponent
                            className={`h-6 w-6 ${item.iconColor}`}
                          />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {item.title}
                        </h3>
                        <div className="text-gray-600 mt-1">
                          {item.content.map((line, idx) => (
                            <p key={idx}>{line}</p>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Quick Support Card */}
            <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
              <CardContent className="p-6">
                <CardTitle className="text-xl text-white mb-4">
                  Hỗ Trợ Nhanh
                </CardTitle>
                <CardDescription className="text-blue-100 mb-4">
                  Cần hỗ trợ ngay lập tức? Chúng tôi có đội ngũ tư vấn viên
                  online 24/7
                </CardDescription>
                <Button
                  variant="secondary"
                  className="bg-white text-blue-600 hover:bg-blue-50"
                >
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Chat Ngay
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="border-gray-100">
              <CardHeader>
                <CardTitle className="text-2xl">Gửi Tin Nhắn</CardTitle>
              </CardHeader>
              <CardContent>
                {isSubmitted ? (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <AlertDescription className="text-green-800">
                      <div className="font-semibold mb-1">Gửi Thành Công!</div>
                      Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi trong vòng
                      24h.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Họ và Tên *</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            id="name"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleInputChange}
                            className="pl-10"
                            placeholder="Nhập họ và tên"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            type="email"
                            id="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleInputChange}
                            className="pl-10"
                            placeholder="Nhập email"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Số Điện Thoại</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="pl-10"
                            placeholder="Nhập số điện thoại"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="company">Công Ty</Label>
                        <div className="relative">
                          <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            id="company"
                            name="company"
                            value={formData.company}
                            onChange={handleInputChange}
                            className="pl-10"
                            placeholder="Nhập tên công ty"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Chủ Đề *</Label>
                      <Select
                        value={formData.subject}
                        onValueChange={handleSelectChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn chủ đề" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="product-inquiry">
                            Hỏi về sản phẩm
                          </SelectItem>
                          <SelectItem value="order-support">
                            Hỗ trợ đơn hàng
                          </SelectItem>
                          <SelectItem value="technical-support">
                            Hỗ trợ kỹ thuật
                          </SelectItem>
                          <SelectItem value="partnership">
                            Hợp tác kinh doanh
                          </SelectItem>
                          <SelectItem value="feedback">
                            Góp ý - Phản hồi
                          </SelectItem>
                          <SelectItem value="other">Khác</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Tin Nhắn *</Label>
                      <Textarea
                        id="message"
                        name="message"
                        required
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder="Nhập nội dung tin nhắn..."
                        className="resize-none"
                      />
                    </div>

                    <Button
                      onClick={handleSubmit}
                      className="w-full h-12"
                      size="lg"
                    >
                      <Send className="h-5 w-5 mr-2" />
                      Gửi Tin Nhắn
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-12">
          <Card className="border-gray-100">
            <CardHeader className="border-b">
              <CardTitle className="text-2xl">Vị Trí Cửa Hàng</CardTitle>
              <CardDescription>Tìm chúng tôi trên bản đồ</CardDescription>
            </CardHeader>
            <CardContent className="p-0 h-[400px]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3726.4753606005843!2d105.86935307602512!3d20.933416991045032!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMjDCsDU2JzAwLjMiTiAxMDXCsDUyJzE4LjkiRQ!5e0!3m2!1svi!2s!4v1749111330010!5m2!1svi!2s"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ContactComponent;
