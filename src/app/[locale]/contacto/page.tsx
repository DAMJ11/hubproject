"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";

export default function ContactoPage() {
  const t = useTranslations("Contact");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <main className="min-h-screen">
      <Header />

      <section className="bg-gradient-to-b from-[#f0f5f3] to-white py-12 md:py-16">
        <div className="container-custom mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-[#1a365d]">
            {t("title")}
          </h1>
          <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white">
        <div className="container-custom mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-[#1a365d] mb-8">
                {t("formTitle")}
              </h2>
              {submitted ? (
                <Card className="p-8 bg-[#2563eb]/10 border-[#2563eb]">
                  <CardContent className="text-center p-0">
                    <h3 className="text-2xl font-bold text-[#2563eb] mb-4">
                      {t("successTitle")}
                    </h3>
                    <p className="text-gray-600">
                      {t("successText")}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("name")}
                    </label>
                    <Input
                      type="text"
                      placeholder={t("namePlaceholder")}
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="rounded-lg px-4 py-3"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("email")}
                    </label>
                    <Input
                      type="email"
                      placeholder={t("emailPlaceholder")}
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="rounded-lg px-4 py-3"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("subject")}
                    </label>
                    <Input
                      type="text"
                      placeholder={t("subjectPlaceholder")}
                      value={formData.subject}
                      onChange={(e) =>
                        setFormData({ ...formData, subject: e.target.value })
                      }
                      className="rounded-lg px-4 py-3"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("message")}
                    </label>
                    <textarea
                      placeholder={t("messagePlaceholder")}
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      className="w-full h-32 rounded-lg px-4 py-3 border border-input bg-transparent focus:outline-none focus:ring-1 focus:ring-ring"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="bg-[#1a365d] hover:bg-[#152d4f] text-white rounded-full px-8 py-6 text-lg font-medium w-full"
                  >
                    {t("send")}
                  </Button>
                </form>
              )}
            </div>

            <div className="space-y-8">
              <h2 className="text-3xl font-bold text-[#1a365d] mb-8">
                {t("infoTitle")}
              </h2>

              <Card className="p-6 rounded-2xl">
                <CardContent className="flex items-start gap-4 p-0">
                  <div className="w-12 h-12 bg-[#2563eb]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-[#2563eb]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#1a365d] mb-1">{t("emailLabel")}</h3>
                    <p className="text-gray-600">info@projecthub.com</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="p-6 rounded-2xl">
                <CardContent className="flex items-start gap-4 p-0">
                  <div className="w-12 h-12 bg-[#2563eb]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-[#2563eb]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#1a365d] mb-1">{t("phoneLabel")}</h3>
                    <p className="text-gray-600">+31 20 123 4567</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="p-6 rounded-2xl">
                <CardContent className="flex items-start gap-4 p-0">
                  <div className="w-12 h-12 bg-[#2563eb]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-[#2563eb]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#1a365d] mb-1">{t("addressLabel")}</h3>
                    <p className="text-gray-600">
                      {t("address")}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="bg-[#f8f8f8] p-8 rounded-2xl">
                <h3 className="text-xl font-bold text-[#1a365d] mb-4">
                  {t("hoursLabel")}
                </h3>
                <div className="space-y-2 text-gray-600">
                  <p>{t("weekdays")}</p>
                  <p>{t("weekends")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

