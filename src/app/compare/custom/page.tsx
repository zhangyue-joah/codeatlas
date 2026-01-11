import { redirect } from 'next/navigation';

/**
 * 兼容旧链接：自选对比已收敛到产品列表页的弹窗交互。
 */
export default function CompareCustomRedirectPage() {
  redirect('/tools');
}

