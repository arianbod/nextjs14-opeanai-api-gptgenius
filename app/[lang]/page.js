// app/[lang]/page.js
import React from "react";
import { getDictionary } from "@/lib/dictionary";
import ClientHome from "@/components/ClientHome";
import { useTranslations } from "@/context/TranslationContext";

export default async function Home(props) {
    const params = await props.params;

    const {
        lang
    } = params;

    return <ClientHome />;
}