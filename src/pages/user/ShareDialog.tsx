import { useRef, useEffect, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { toast } from 'react-hot-toast';
import { toSvg, toPng } from 'html-to-image';
import { saveAs } from 'file-saver';
import { useCopyToClipboard } from 'usehooks-ts';

import poster from '@/assets/poster.png';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useMobileScreen } from '@/hooks/use-mobile-screen';
import useWechat from '@/hooks/use-wechat';
import useTask from '@/hooks/use-task';

type ShareDialogProps = {
  open: boolean;
  shareUrl: string;
  handleOpenChange: (val: boolean) => void;
};

export function ShareDialog({ open, shareUrl, handleOpenChange }: ShareDialogProps) {
  const posterRef = useRef<HTMLDivElement>(null);
  const isMobileScreen = useMobileScreen();
  const [dataUrl, setDataUrl] = useState('');
  const { shareCallback } = useTask();
  const [, copy] = useCopyToClipboard();
  const { isWeixinBrowser } = useWechat();

  const drawImage = async () => {
    if (!posterRef.current) return;
    // 微信浏览器中 toPng 方法，偶发生成失败，所以使用 toSvg 方法
    const drawImageFn = isWeixinBrowser ? toSvg : toPng;
    const res = await drawImageFn(posterRef.current, { style: { opacity: '1' } });

    setDataUrl(res);
  };

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        drawImage();
      }, 500);
    }
  }, [open]);

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) {
          shareCallback();
        }
        handleOpenChange(val);
      }}
    >
      <DialogContent className="w-[25rem]">
        <DialogTitle>分享</DialogTitle>
        <div>
          <div className="mb-2 flex">
            <Input value={shareUrl} disabled></Input>
            <Button
              className="ml-2 shrink-0"
              onClick={() => {
                copy(shareUrl);
                toast.success('复制成功');
              }}
            >
              复制链接
            </Button>
          </div>
          <div className="relative overflow-auto max-sm:h-[30rem]">
            <img src={dataUrl} className="absolute left-0 top-0 z-10 w-full" alt="" />
            <div className="relative" ref={posterRef}>
              <img src={poster} className="w-full" />
              <QRCodeCanvas
                className="absolute bottom-1 left-[50%] m-auto -translate-x-1/2"
                style={{
                  width: '3.5rem',
                  height: '3.5rem',
                }}
                value={shareUrl}
              />
            </div>
          </div>
          <DialogDescription className="mt-2 text-center">
            {isMobileScreen && '长按'}保存上方图片，分享你专属海报给朋友
          </DialogDescription>
        </div>
        <DialogFooter>
          {!isMobileScreen && (
            <Button
              className="mt-2"
              onClick={() => {
                saveAs(dataUrl, '分享海报.jpg');
              }}
            >
              下载
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
