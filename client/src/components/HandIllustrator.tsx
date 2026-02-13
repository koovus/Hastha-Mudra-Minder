import { useState, useRef, useCallback, useEffect } from "react";
import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";
import { Upload, Loader2, RotateCcw, Sparkles, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HandIllustratorProps {
  onIllustrationReady: (dataUrl: string) => void;
  existingImage?: string | null;
}

const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [0, 9], [9, 10], [10, 11], [11, 12],
  [0, 13], [13, 14], [14, 15], [15, 16],
  [0, 17], [17, 18], [18, 19], [19, 20],
  [5, 9], [9, 13], [13, 17],
];

const FINGER_TIPS = [4, 8, 12, 16, 20];
const FINGER_MIDS = [3, 7, 11, 15, 19];
const KNUCKLES = [2, 6, 10, 14, 18];
const PALM_POINTS = [0, 1, 5, 9, 13, 17];

function drawStylizedHand(
  canvas: HTMLCanvasElement,
  landmarks: { x: number; y: number; z: number }[]
) {
  const ctx = canvas.getContext("2d")!;
  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);

  const bg = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.6);
  bg.addColorStop(0, "hsl(40 30% 96%)");
  bg.addColorStop(1, "hsl(35 25% 91%)");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  const pts = landmarks.map((l) => ({
    x: l.x * w,
    y: l.y * h,
    z: l.z,
  }));

  const palmColor = "hsl(150 25% 35%)";
  const lineColor = "hsl(150 20% 45%)";
  const accentColor = "hsl(25 50% 55%)";
  const softLine = "hsl(150 15% 60%)";

  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  ctx.save();
  ctx.beginPath();
  const palmOrder = [0, 1, 5, 9, 13, 17];
  ctx.moveTo(pts[palmOrder[0]].x, pts[palmOrder[0]].y);
  for (let i = 1; i < palmOrder.length; i++) {
    const prev = pts[palmOrder[i - 1]];
    const curr = pts[palmOrder[i]];
    const cpx = (prev.x + curr.x) / 2;
    const cpy = (prev.y + curr.y) / 2;
    ctx.quadraticCurveTo(prev.x, prev.y, cpx, cpy);
  }
  ctx.closePath();
  ctx.fillStyle = "hsl(150 15% 85% / 0.3)";
  ctx.fill();
  ctx.strokeStyle = softLine;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();

  for (const [i, j] of HAND_CONNECTIONS) {
    const p1 = pts[i];
    const p2 = pts[j];

    const isFinger = !PALM_POINTS.includes(i) || !PALM_POINTS.includes(j);
    const depth = Math.abs(p1.z + p2.z) / 2;
    const thickness = isFinger ? 2 + depth * 8 : 2.5 + depth * 6;

    ctx.beginPath();

    const mx = (p1.x + p2.x) / 2 + (Math.random() - 0.5) * 2;
    const my = (p1.y + p2.y) / 2 + (Math.random() - 0.5) * 2;
    ctx.moveTo(p1.x, p1.y);
    ctx.quadraticCurveTo(mx, my, p2.x, p2.y);

    ctx.strokeStyle = lineColor;
    ctx.lineWidth = Math.max(1.5, Math.min(thickness, 4));
    ctx.stroke();
  }

  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    const isTip = FINGER_TIPS.includes(i);
    const isKnuckle = KNUCKLES.includes(i);
    const isWrist = i === 0;

    if (isTip) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = accentColor;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(p.x, p.y, 7, 0, Math.PI * 2);
      ctx.strokeStyle = "hsl(25 50% 55% / 0.3)";
      ctx.lineWidth = 1;
      ctx.stroke();
    } else if (isKnuckle || isWrist) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, isWrist ? 4 : 3, 0, Math.PI * 2);
      ctx.fillStyle = palmColor;
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = lineColor;
      ctx.fill();
    }
  }

  const touchingPairs: [number, number][] = [];
  for (let i = 0; i < FINGER_TIPS.length; i++) {
    for (let j = i + 1; j < FINGER_TIPS.length; j++) {
      const a = pts[FINGER_TIPS[i]];
      const b = pts[FINGER_TIPS[j]];
      const dist = Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
      if (dist < w * 0.06) {
        touchingPairs.push([FINGER_TIPS[i], FINGER_TIPS[j]]);
      }
    }
  }

  for (const [a, b] of touchingPairs) {
    const pa = pts[a];
    const pb = pts[b];
    const cx = (pa.x + pb.x) / 2;
    const cy = (pa.y + pb.y) / 2;

    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 15);
    glow.addColorStop(0, "hsl(40 60% 70% / 0.5)");
    glow.addColorStop(1, "hsl(40 60% 70% / 0)");
    ctx.beginPath();
    ctx.arc(cx, cy, 15, 0, Math.PI * 2);
    ctx.fillStyle = glow;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(cx, cy, 2, 0, Math.PI * 2);
    ctx.fillStyle = "hsl(40 70% 60%)";
    ctx.fill();
  }

  const wrist = pts[0];
  const middleTip = pts[12];
  const handAngle = Math.atan2(middleTip.y - wrist.y, middleTip.x - wrist.x);

  for (let i = 0; i < 6; i++) {
    const angle = handAngle + (Math.random() - 0.5) * 1.2;
    const dist = 20 + Math.random() * 30;
    const sx = wrist.x + Math.cos(angle + Math.PI) * dist;
    const sy = wrist.y + Math.sin(angle + Math.PI) * dist;

    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + Math.cos(angle + Math.PI) * (8 + Math.random() * 12), sy + Math.sin(angle + Math.PI) * (8 + Math.random() * 12));
    ctx.strokeStyle = `hsl(150 20% 70% / ${0.2 + Math.random() * 0.3})`;
    ctx.lineWidth = 0.5 + Math.random();
    ctx.stroke();
  }
}

export default function HandIllustrator({ onIllustrationReady, existingImage }: HandIllustratorProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "processing" | "done" | "error">("idle");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [illustrationDataUrl, setIllustrationDataUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);

  const initHandLandmarker = useCallback(async () => {
    if (handLandmarkerRef.current) return handLandmarkerRef.current;

    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    );

    const handLandmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
        delegate: "GPU",
      },
      numHands: 2,
      runningMode: "IMAGE",
    });

    handLandmarkerRef.current = handLandmarker;
    return handLandmarker;
  }, []);

  const processImage = useCallback(
    async (imageSrc: string) => {
      setStatus("loading");
      setErrorMsg("");

      try {
        const handLandmarker = await initHandLandmarker();
        setStatus("processing");

        const img = new Image();
        img.crossOrigin = "anonymous";
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error("Failed to load image"));
          img.src = imageSrc;
        });

        const results = handLandmarker.detect(img);

        if (!results.landmarks || results.landmarks.length === 0) {
          setStatus("error");
          setErrorMsg("No hand detected. Try a clearer photo with your hand visible.");
          return;
        }

        const canvas = canvasRef.current!;
        canvas.width = 400;
        canvas.height = 400;

        drawStylizedHand(canvas, results.landmarks[0]);

        const dataUrl = canvas.toDataURL("image/png");
        setIllustrationDataUrl(dataUrl);
        onIllustrationReady(dataUrl);
        setStatus("done");
      } catch (err) {
        console.error("Hand detection error:", err);
        setStatus("error");
        setErrorMsg("Could not process image. Try a different photo.");
      }
    },
    [initHandLandmarker, onIllustrationReady]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (ev) => {
        const src = ev.target?.result as string;
        setUploadedImage(src);
        processImage(src);
      };
      reader.readAsDataURL(file);
    },
    [processImage]
  );

  const handleRetry = () => {
    setStatus("idle");
    setUploadedImage(null);
    setIllustrationDataUrl(null);
    setErrorMsg("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  useEffect(() => {
    return () => {
      if (handLandmarkerRef.current) {
        handLandmarkerRef.current.close();
      }
    };
  }, []);

  if (existingImage && status === "idle") {
    return (
      <div className="relative rounded-2xl overflow-hidden border border-border/50 bg-muted/20">
        <img src={existingImage} alt="Mudra illustration" className="w-full aspect-square object-contain" />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="absolute bottom-3 right-3 shadow-md"
          onClick={handleRetry}
        >
          <RotateCcw className="w-3 h-3 mr-1" /> Change
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileSelect}
        data-testid="input-hand-photo"
      />

      <canvas ref={canvasRef} className="hidden" />

      {status === "idle" && (
        <div
          className="border-2 border-dashed border-border rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-4 bg-muted/20 hover:bg-muted/30 hover:border-primary/30 transition-all cursor-pointer group"
          onClick={() => fileInputRef.current?.click()}
          data-testid="button-upload-hand"
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Camera className="w-7 h-7 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">Upload Hand Photo</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-[220px]">
              Take a photo of your hand position and we'll create an illustration
            </p>
          </div>
        </div>
      )}

      {(status === "loading" || status === "processing") && (
        <div className="border-2 border-primary/20 rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-4 bg-primary/5">
          <div className="relative">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <Sparkles className="w-4 h-4 text-primary/60 absolute -top-1 -right-1 animate-pulse" />
          </div>
          <div>
            <p className="font-medium text-foreground">
              {status === "loading" ? "Loading hand detection..." : "Creating illustration..."}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {status === "loading" ? "Preparing the AI model" : "Tracing your hand's landmarks"}
            </p>
          </div>
        </div>
      )}

      {status === "done" && illustrationDataUrl && (
        <div className="space-y-3">
          <div className="relative rounded-2xl overflow-hidden border border-primary/20 bg-muted/20 shadow-sm">
            <img src={illustrationDataUrl} alt="Hand illustration" className="w-full aspect-square object-contain" />
            <div className="absolute top-3 left-3 bg-primary/90 text-primary-foreground text-[10px] px-2 py-1 rounded-full font-medium uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> AI Generated
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={handleRetry}
            >
              <RotateCcw className="w-3 h-3 mr-1" /> Try Again
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-3 h-3 mr-1" /> New Photo
            </Button>
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="space-y-3">
          {uploadedImage && (
            <div className="rounded-2xl overflow-hidden border border-destructive/20 bg-destructive/5">
              <img src={uploadedImage} alt="Uploaded" className="w-full aspect-square object-cover opacity-60" />
            </div>
          )}
          <div className="text-center p-4 bg-destructive/5 rounded-xl border border-destructive/10">
            <p className="text-sm text-destructive font-medium">{errorMsg}</p>
          </div>
          <Button type="button" variant="outline" className="w-full" onClick={handleRetry}>
            <RotateCcw className="w-4 h-4 mr-2" /> Try Another Photo
          </Button>
        </div>
      )}
    </div>
  );
}
