'use client';

import { ChangeEvent, useEffect, useState } from 'react';
import { Download, FileUp, Save, Trash2, TriangleAlert } from 'lucide-react';
import { categoriesData, experiencesData, imagesData, placesData, routeGeometries, routeMatrix, sourcesData } from '@/lib/data/repository';
import type { Place } from '@/lib/data/types';
import { clearContentDraft, downloadJson, readContentDraft, writeContentDraft } from '@/lib/storage/local-data';
import { validateCatalog } from '@/lib/data/validate';

function validatePlacesJson(text: string): { places: Place[] | null; error: string | null } {
  try {
    const value: unknown = JSON.parse(text);
    if (!Array.isArray(value)) return { places: null, error: 'JSON cần là một danh sách địa điểm.' };
    validateCatalog({ categories: categoriesData, places: value as Place[], experiences: experiencesData, sources: sourcesData, images: imagesData, matrix: routeMatrix, routes: routeGeometries });
    return { places: value as Place[], error: null };
  } catch (error) {
    return { places: null, error: error instanceof Error ? error.message : 'Không đọc được JSON.' };
  }
}

export default function LocalContentEditor() {
  const [text, setText] = useState(() => JSON.stringify(placesData, null, 2));
  const [notice, setNotice] = useState('');
  useEffect(() => {
    const draft = readContentDraft();
    if (draft) setText(draft);
  }, []);
  const validation = validatePlacesJson(text);

  const importFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 1_000_000) { setNotice('Tệp vượt giới hạn 1 MB.'); return; }
    try {
      const content = await file.text();
      const checked = validatePlacesJson(content);
      if (checked.error) setNotice(`Không nhập được: ${checked.error}`);
      else { setText(JSON.stringify(checked.places, null, 2)); setNotice(`Đã nạp ${checked.places?.length ?? 0} địa điểm để xem trước trên thiết bị.`); }
    } catch { setNotice('Không đọc được tệp trên thiết bị.'); }
    event.target.value = '';
  };

  const saveDraft = () => {
    if (validation.error) { setNotice(`Chưa lưu: ${validation.error}`); return; }
    setNotice(writeContentDraft(text).message);
  };
  const clearDraft = () => {
    const result = clearContentDraft();
    if (result.ok) setText(JSON.stringify(placesData, null, 2));
    setNotice(result.message);
  };

  return <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8"><p className="text-xs font-bold uppercase tracking-[.18em] text-[#40916C]">Công cụ trên thiết bị</p><h1 className="mt-2 text-3xl font-black text-[#1B4332]">Biên tập dữ liệu địa điểm</h1><p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-600">Nhập hoặc sửa bản sao JSON, kiểm tra tham chiếu và xuất tệp để cập nhật repository. Thay đổi lưu trên thiết bị; trang này không đăng nội dung, không đồng bộ và không cập nhật website công khai.</p>
    <div className="mt-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950"><TriangleAlert size={18} className="mt-1 shrink-0" /><p>Chỉ đưa thông tin có nguồn và trạng thái kiểm tra. Tọa độ, giá, giờ hoặc hoạt động chưa xác minh cần để `null`/`needs_confirmation`. Ảnh chỉ xuất bản sau khi có quyền sử dụng được ghi nhận.</p></div>
    <div className="mt-6 flex flex-wrap gap-2"><label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-bold text-zinc-700"><FileUp size={16} /> Nhập JSON<input type="file" accept="application/json,.json" onChange={importFile} className="sr-only" /></label><button type="button" onClick={saveDraft} disabled={Boolean(validation.error)} className="inline-flex items-center gap-2 rounded-lg bg-[#1B4332] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"><Save size={16} /> Lưu bản nháp trên thiết bị</button><button type="button" onClick={() => downloadJson('places.json', validation.places ?? placesData)} disabled={Boolean(validation.error)} className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-bold text-zinc-700 disabled:opacity-50"><Download size={16} /> Xuất places.json</button><button type="button" onClick={clearDraft} className="inline-flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-zinc-600 hover:bg-zinc-100"><Trash2 size={15} /> Bỏ bản nháp</button></div>
    <label className="mt-4 block text-sm font-bold text-zinc-800">Bản sao `places.json`<textarea value={text} onChange={(event) => setText(event.target.value)} spellCheck={false} className="mt-2 min-h-[480px] w-full rounded-xl border border-zinc-300 bg-white p-4 font-mono text-xs leading-5 text-zinc-800 outline-none focus:border-[#40916C] focus:ring-2 focus:ring-emerald-100" /></label>
    <p role="status" className={`mt-3 text-sm ${validation.error ? 'text-rose-700' : 'text-emerald-800'}`}>{validation.error ? `JSON chưa hợp lệ: ${validation.error}` : `${validation.places?.length ?? 0} địa điểm; ID, danh mục, nguồn, ảnh và dữ liệu tuyến hợp lệ.`}</p>
    {notice && <p className="mt-2 text-sm text-zinc-600">{notice}</p>}
    <p className="mt-5 rounded-xl bg-[#F8FAF9] p-4 text-xs leading-5 text-zinc-600">Tệp xuất không tự thay đổi repository hoặc website. Sau khi kiểm tra nội dung và quyền ảnh, người quản lý nội dung cần đưa JSON vào thư mục `data/` rồi redeploy.</p>
  </section>;
}
