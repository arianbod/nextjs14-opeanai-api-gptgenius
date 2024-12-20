// app/[lang]/(dashboard)/verify-email/page.js

import React, { Suspense } from 'react';
import VerifyEmailClient from '@/components/VerifyEmailClient';
import Loading from '@/components/Loading';

const VerifyEmailPage = () => (
    <Suspense fallback={<Loading />}>
        <VerifyEmailClient />
    </Suspense>
);

export default VerifyEmailPage;
