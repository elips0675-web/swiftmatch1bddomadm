import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Heart, MessageCircle, MoreHorizontal, Send, Share2, ChevronLeft, ChevronRight, Search, PlusCircle, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/context/language-context";
import { containsForbiddenWords, isGibberish } from "@/lib/word-filter";
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// --- PostText with Spoiler ---
const PostText = ({ text, charLimit = 280 }: { text: string, charLimit?: number }) => {
  const { language } = useLanguage();
  const tr = (ru: string, en: string) => (language === "RU" ? ru : en);
  const [isExpanded, setIsExpanded] = useState(false);

  if (!text) return null;
  if (text.length <= charLimit) {
    return <p className="px-5 pb-2 text-gray-800 text-[15px] leading-relaxed whitespace-pre-wrap">{text}</p>;
  }

  const toggleExpand = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="px-5 pb-2 text-gray-800 text-[15px] leading-relaxed">
      <p className="whitespace-pre-wrap">
        {isExpanded ? text : `${text.substring(0, charLimit)}...`}
        <button onClick={toggleExpand} className="text-blue-500 hover:underline ml-1 font-semibold text-sm">
          {isExpanded ? tr("Скрыть", "Hide") : tr("Показать больше", "Show more")}
        </button>
      </p>
    </div>
  );
};

// --- Lightbox Component ---
const Lightbox = ({
  images,
  selectedIndex,
  onClose,
}: {
  images: string[];
  selectedIndex: number;
  onClose: () => void;
}) => {
  const [currentIndex, setCurrentIndex] = useState(selectedIndex);

  const goToNext = useCallback((e: React.MouseEvent | KeyboardEvent) => {
    e.stopPropagation();
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  }, [images.length]);

  const goToPrevious = useCallback((e: React.MouseEvent | KeyboardEvent) => {
    e.stopPropagation();
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') goToNext(e);
      if (e.key === 'ArrowLeft') goToPrevious(e);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, goToNext, goToPrevious]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center backdrop-blur-sm"
      onClick={onClose}
    >
      <AnimatePresence initial={false}>
        <motion.img
          key={currentIndex}
          src={images[currentIndex]}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="max-h-[90vh] max-w-[90vw] object-contain"
          onClick={(e) => e.stopPropagation()}
        />
      </AnimatePresence>

      <button
        className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors z-[101]"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      >
        <X size={32} />
      </button>

      {images.length > 1 && (
        <>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/60 transition-all z-[101]"
            onClick={goToPrevious}
          >
            <ChevronLeft size={28} />
          </button>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/60 transition-all z-[101]"
            onClick={goToNext}
          >
            <ChevronRight size={28} />
          </button>
        </>
      )}
    </motion.div>
  );
};

// --- Post Image Gallery Component (New Layout) ---
const PostImageGallery = ({ images }: { images: string[] }) => {
  const [isLightboxOpen, setLightboxOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const openLightbox = (index: number) => {
    setSelectedIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);

  const count = images.length;
  if (count === 0) return null;

  const renderImage = (index: number, className: string = "") => (
    <div className={cn("bg-gray-200 overflow-hidden", className)} onClick={() => openLightbox(index)}>
      {/* Template uses <img>; keep it for simplicity and low Next.js overhead */}
      <img
        src={images[index]}
        alt={`Post image ${index + 1}`}
        className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
      />
    </div>
  );

  return (
    <div className="px-5 pt-1">
      <div className="mt-2 rounded-xl overflow-hidden border border-gray-200/80">
        {count === 1 && renderImage(0, "aspect-video")}
        {count === 2 && <div className="grid grid-cols-2 gap-1">{renderImage(0, "aspect-square")}{renderImage(1, "aspect-square")}</div>}
        {count === 3 && (
          <div className="grid grid-cols-2 gap-1">
            {renderImage(0, "aspect-[2/3] row-span-2")}
            <div className="grid grid-rows-2 gap-1">
              {renderImage(1, "aspect-square")}
              {renderImage(2, "aspect-square")}
            </div>
          </div>
        )}
        {count === 4 && (
          <div className="grid grid-cols-2 grid-rows-2 gap-1">
            {renderImage(0, "aspect-square")}
            {renderImage(1, "aspect-square")}
            {renderImage(2, "aspect-square")}
            {renderImage(3, "aspect-square")}
          </div>
        )}
        {count >= 5 && (
          <div className="flex flex-col gap-1">
            <div className="flex gap-1">
              {renderImage(0, "w-1/2 aspect-video")}
              {renderImage(1, "w-1/2 aspect-video")}
            </div>
            <div className="flex gap-1">
              {renderImage(2, "w-1/3 aspect-square")}
              {renderImage(3, "w-1/3 aspect-square")}
              <div className="w-1/3 aspect-square relative bg-gray-200 cursor-pointer" onClick={() => openLightbox(4)}>
                <img src={images[4]} alt="Post image 5" className="w-full h-full object-cover" />
                {count > 5 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-white font-bold text-4xl">+{count - 5}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      {isLightboxOpen && <Lightbox images={images} selectedIndex={selectedIndex} onClose={closeLightbox} />}
    </div>
  );
};

// --- Post Image Uploader Component ---
const PostImageUploader = ({
  images,
  setImages,
  newPostImageUrls,
  setNewPostImageUrls,
}: {
  images: string[];
  setImages: (images: string[]) => void;
  newPostImageUrls: string;
  setNewPostImageUrls: (urls: string) => void;
}) => {
  const { language } = useLanguage();
  const tr = (ru: string, en: string) => (language === "RU" ? ru : en);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const maxFiles = 14;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const fileArray = Array.from(files).slice(0, maxFiles - images.length);

    fileArray.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setImages([...images, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
    event.target.value = '';
  };

  const triggerFileInput = () => fileInputRef.current?.click();

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">
          {tr("Добавить фото", "Add photos")} ({images.length}/{maxFiles})
        </Label>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {images.map((image, index) => (
            <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
              <img src={image} alt={`preview ${index}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 backdrop-blur-sm hover:bg-black/80 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          {images.length < maxFiles && (
            <button
              type="button"
              onClick={triggerFileInput}
              className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-blue-500 hover:text-blue-500 transition-colors"
            >
              <PlusCircle size={24} />
              <span className="text-xs font-semibold mt-1">{tr("Добавить", "Add")}</span>
            </button>
          )}
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/png, image/jpeg, image/gif, image/webp"
          multiple
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="post-images-url" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">
          {tr("Или по ссылке", "Or by link")}
        </Label>
        <Input
          id="post-images-url"
          value={newPostImageUrls}
          onChange={(e) => setNewPostImageUrls(e.target.value)}
          className="h-12 rounded-xl bg-muted/50 border-0"
          placeholder={tr("Вставьте ссылку на изображение", "Paste image URL")}
        />
      </div>
    </div>
  );
};

// --- Demo Data (Expanded) ---
const initialPosts = [
  {
    id: 10,
    author: 'Красивый футбол',
    group: 'Эстетика',
    avatar: 'https://picsum.photos/seed/beautiful_game/100/100',
    time: '45 минут назад',
    text: 'Просто наслаждайтесь этими кадрами. 14 фото.',
    images: [
      'https://picsum.photos/seed/goal_celebration/800/500',
      'https://picsum.photos/seed/overhead_kick/800/500',
      'https://picsum.photos/seed/stadium_sunset/500/500',
      'https://picsum.photos/seed/keeper_save/500/500',
      'https://picsum.photos/seed/team_huddle/500/500',
      'https://picsum.photos/seed/fans_lights/800/600',
      'https://picsum.photos/seed/football_art_1/800/600',
      'https://picsum.photos/seed/football_art_2/800/600',
      'https://picsum.photos/seed/football_art_3/800/600',
      'https://picsum.photos/seed/football_art_4/800/600',
      'https://picsum.photos/seed/football_art_5/800/600',
      'https://picsum.photos/seed/football_art_6/800/600',
      'https://picsum.photos/seed/football_art_7/800/600',
      'https://picsum.photos/seed/football_art_8/800/600',
    ],
    likes: 7650,
    commentsCount: 3,
    isLiked: false,
    comments: [{ id: 1, author: 'ArtLover', avatar: 'https://picsum.photos/seed/art/100/100', time: '20м', text: 'Вау, потрясающе!' }],
  },
  {
    id: 14,
    author: 'Old School Football',
    group: 'Легенды',
    avatar: 'https://picsum.photos/seed/oldschool/100/100',
    time: '1 час назад',
    text: 'Эпоха, когда футбол был другим. Меньше денег, больше души. #oldschool #football #legends',
    images: ['https://picsum.photos/seed/classic_match_1/800/600', 'https://picsum.photos/seed/classic_match_2/800/600', 'https://picsum.photos/seed/classic_match_3/800/600'],
    likes: 3200,
    commentsCount: 0,
    isLiked: false,
    comments: [],
  },
  {
    id: 13,
    author: 'Football Tactics Explained',
    group: 'Стратегии и ставки',
    avatar: 'https://picsum.photos/seed/tactics_master/100/100',
    time: '2 часа назад',
    text: 'Сегодня глубоко погружаемся в концепцию \'гегенпрессинга\', популяризированную Юргеном Клоппом. Это не просто бессмысленный бег, а высокоорганизованная система... (и далее по тексту)',
    images: ['https://picsum.photos/seed/gegenpress/800/600'],
    likes: 850,
    commentsCount: 5,
    isLiked: false,
    comments: [],
  },
  {
    id: 1,
    author: 'ФК "Зенит"',
    group: 'PRO Лига',
    avatar: 'https://picsum.photos/seed/zenit/100/100',
    time: '3 часа назад',
    text: 'Готовимся к следующему матчу! 💪⚽️ 5 фото с тренировки.',
    images: [
      'https://picsum.photos/seed/football_training_1/800/600',
      'https://picsum.photos/seed/football_training_2/800/600',
      'https://picsum.photos/seed/football_training_3/800/600',
      'https://picsum.photos/seed/football_action_1/800/600',
      'https://picsum.photos/seed/football_stadium_1/800/600',
    ],
    likes: 1256,
    commentsCount: 1,
    isLiked: false,
    comments: [{ id: 1, author: 'Иван Петров', avatar: 'https://picsum.photos/seed/user1/100/100', time: '1 час назад', text: 'Отличная работа, команда! Верим в победу!' }],
  },
  {
    id: 15,
    author: 'Footy News',
    group: 'PRO Лига',
    avatar: 'https://picsum.photos/seed/footynews/100/100',
    time: '4 часа назад',
    text: 'Невероятный камбэк в последнем матче! Кто смотрел?',
    images: ['https://picsum.photos/seed/comeback_1/800/500', 'https://picsum.photos/seed/comeback_2/800/500'],
    likes: 1800,
    commentsCount: 0,
    isLiked: false,
    comments: [],
  },
  {
    id: 4,
    author: 'Лига Чемпионов',
    group: 'PRO Лига',
    avatar: 'https://picsum.photos/seed/uefa/100/100',
    time: '5 часов назад',
    text: 'Лучшие моменты вчерашнего игрового дня. 4 фото.',
    images: ['https://picsum.photos/seed/champ_1/800/600', 'https://picsum.photos/seed/champ_2/800/600', 'https://picsum.photos/seed/champ_3/800/600', 'https://picsum.photos/seed/champ_4/800/600'],
    likes: 2100,
    commentsCount: 0,
    isLiked: false,
    comments: [],
  },
  {
    id: 16,
    author: 'Стадионы Мира',
    group: 'Эстетика',
    avatar: 'https://picsum.photos/seed/stadiums/100/100',
    time: '6 часов назад',
    text: 'Величие "Сантьяго Бернабеу".',
    images: ['https://picsum.photos/seed/bernabeu/800/550'],
    likes: 6700,
    commentsCount: 0,
    isLiked: false,
    comments: [],
  },
  {
    id: 5,
    author: 'Тактика',
    group: 'Стратегии и ставки',
    avatar: 'https://picsum.photos/seed/tactic_user/100/100',
    time: '7 часов назад',
    text: 'Разбираем схему 4-3-3 на конкретных примерах. 3 фото.',
    images: ['https://picsum.photos/seed/tactic_1/800/600', 'https://picsum.photos/seed/tactic_2/800/600', 'https://picsum.photos/seed/tactic_3/800/600'],
    likes: 600,
    commentsCount: 0,
    isLiked: false,
    comments: [],
  },
];

// --- Main Feed Component ---
export function FootballFeed() {
  const [posts, setPosts] = useState(initialPosts);
  const [searchQuery, setSearchQuery] = useState("");
  const [commentInputs, setCommentInputs] = useState<{ [key: number]: string }>({});
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [newPostText, setNewPostText] = useState("");
  const [newPostImages, setNewPostImages] = useState<string[]>([]);
  const [newPostImageUrls, setNewPostImageUrls] = useState("");

  // Fallbacks to avoid broken images if upstream (picsum) is blocked.
  const fallbackPool = useMemo(
    () => [
      "/demo/people/anna.png",
      "/demo/people/ivan.png",
      "/demo/people/maxim.png",
      "/demo/people/artem.png",
      "/demo/people/elena.png",
      "/demo/people/me.png",
    ],
    []
  );

  const normalizeUrl = useCallback(
    (url: string | undefined, fallbackIndex: number) => {
      if (!url) return fallbackPool[fallbackIndex % fallbackPool.length];
      if (url.startsWith("https://picsum.photos")) return fallbackPool[fallbackIndex % fallbackPool.length];
      return url;
    },
    [fallbackPool]
  );

  const normalizedPosts = useMemo(() => {
    return posts.map((post) => ({
      ...post,
      avatar: normalizeUrl(post.avatar, post.id),
      images: post.images.map((img, i) => normalizeUrl(img, i + post.id)),
      comments: post.comments.map((c, i) => ({
        ...c,
        avatar: normalizeUrl(c.avatar, i + post.id),
      })),
    }));
  }, [posts, normalizeUrl]);

  const filteredPosts = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return normalizedPosts;
    return normalizedPosts.filter(
      (post) =>
        post.text.toLowerCase().includes(query) ||
        post.author.toLowerCase().includes(query) ||
        post.group.toLowerCase().includes(query)
    );
  }, [searchQuery, normalizedPosts]);

  const handleLike = useCallback((postId: number) => {
    setPosts((currentPosts) =>
      currentPosts.map((post) =>
        post.id === postId
          ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
          : post
      )
    );
  }, []);

  const handleShare = useCallback(() => {
    // В шаблоне нет перевода ключей `filter.link_copied.*`, поэтому делаем RU/EN вручную.
    if (language === 'RU') {
      toast({
        title: 'Ссылка скопирована',
        description: 'Скопируйте ссылку и отправьте другу.',
      });
      return;
    }

    toast({
      title: 'Link copied',
      description: 'Copy the link and send it to a friend.',
    });
  }, [toast, language]);

  const handleCommentChange = (postId: number, text: string) => {
    setCommentInputs((prev) => ({ ...prev, [postId]: text }));
  };

  const handleCommentSubmit = (postId: number) => {
    const commentText = commentInputs[postId];
    if (!commentText?.trim()) return;

    if (containsForbiddenWords(commentText)) {
      toast({
        variant: 'destructive',
        title: t('filter.toast.title', { context: 'inappropriate' }),
        description: t('filter.toast.description', { context: 'inappropriate' }),
      });
      return;
    }

    if (isGibberish(commentText)) {
      toast({
        variant: 'destructive',
        title: t('filter.toast.title', { context: 'gibberish' }),
        description: t('filter.toast.gibberish_description', { context: 'gibberish' }),
      });
      return;
    }

    const tr = (ru: string, en: string) => (language === "RU" ? ru : en);
    const newComment = {
      id: Date.now(),
      author: tr("Вы", "You"),
      avatar: "/demo/people/me.png",
      time: tr("Только что", "Just now"),
      text: commentText,
    };

    setPosts((currentPosts) =>
      currentPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              comments: [...post.comments, newComment],
              commentsCount: post.commentsCount + 1,
            }
          : post
      )
    );

    setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
  };

  const handleCreatePost = () => {
    const urlImages = newPostImageUrls
      .split(',')
      .map((url) => url.trim())
      .filter((url) => url.startsWith('http'));
    const allImages = [...newPostImages, ...urlImages];

    if (!newPostText.trim() && allImages.length === 0) {
      toast({
        variant: "destructive",
        title: language === "RU" ? "Пустой пост" : "Empty post",
        description:
          language === "RU"
            ? "Добавьте текст или изображение."
            : "Add text or an image.",
      });
      return;
    }

    const newPost = {
      id: Date.now(),
      author: language === "RU" ? "Вы" : "You",
      group: 'PRO Лига',
      avatar: "/demo/people/me.png",
      time: language === "RU" ? "Только что" : "Just now",
      text: newPostText,
      images: allImages,
      likes: 0,
      commentsCount: 0,
      isLiked: false,
      comments: [],
    };

    setPosts((currentPosts) => [newPost, ...currentPosts]);

    setIsCreatePostOpen(false);
    setNewPostText("");
    setNewPostImages([]);
    setNewPostImageUrls("");

    toast({
      title: language === "RU" ? "Пост опубликован" : "Post published",
    });
  };

  return (
    <div className="bg-gray-100/30 font-sans">
      <div className="max-w-xl mx-auto py-4 px-3">
        <div className="flex gap-2 mb-4 px-1">
          <div className="relative flex-grow">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-11 bg-white border-gray-200/80 rounded-full shadow-sm text-sm font-medium focus:ring-2 focus:ring-blue-400 transition-all w-full"
              placeholder={language === "RU" ? "Поиск по постам..." : "Search posts..."}
            />
          </div>
          <Button
            onClick={() => setIsCreatePostOpen(true)}
            className="h-11 w-11 p-0 rounded-full bg-white border-gray-200/80 shadow-sm text-gray-500 hover:bg-gray-50 active:scale-95"
          >
            <PlusCircle size={20} />
          </Button>
        </div>

        {filteredPosts.map((post) => (
          <div key={post.id} className="bg-white rounded-xl shadow-sm mb-5 border border-gray-200/80 overflow-hidden">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                  <img src={post.avatar} alt={post.author} className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-800 flex items-center gap-1.5">
                    {post.author} <span className="font-medium text-gray-400">·</span>{" "}
                    <span className="font-medium text-blue-500 text-xs">{post.group}</span>
                  </p>
                  <p className="text-gray-500 text-xs font-medium">{post.time}</p>
                </div>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <MoreHorizontal size={20} />
              </button>
            </div>

            <PostText text={post.text} />

            <PostImageGallery images={post.images} />

            <div className="px-5 py-2 flex justify-between items-center border-t border-gray-100 mt-3">
              <div className="flex items-center gap-5">
                <button
                  onClick={() => handleLike(post.id)}
                  className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors font-semibold text-sm py-2 group"
                >
                  <Heart
                    size={20}
                    className={`transition-all ${post.isLiked ? 'text-red-500 fill-red-500' : 'text-gray-400 group-hover:text-red-500/70'}`}
                  />
                  <span className={post.isLiked ? 'text-red-500' : 'text-gray-500'}>{post.likes}</span>
                </button>
                <button className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors font-semibold text-sm py-2">
                  <MessageCircle size={20} className="text-gray-400" />
                  <span>{post.commentsCount}</span>
                </button>
              </div>
              <button onClick={handleShare} className="text-gray-400 hover:text-gray-800 py-2">
                <Share2 size={20} />
              </button>
            </div>

            <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/50">
              {post.comments.map((comment) => (
                <div key={comment.id} className="flex items-start gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden mt-1 flex-shrink-0">
                    <img src={comment.avatar} alt={comment.author} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 bg-gray-100 rounded-xl px-3 py-2">
                    <div className="flex items-baseline gap-2">
                      <p className="font-bold text-xs text-gray-800">{comment.author}</p>
                      <p className="text-gray-400 text-[10px]">{comment.time}</p>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">{comment.text}</p>
                  </div>
                </div>
              ))}

              <div className="flex items-center gap-3 mt-4">
                <div className="w-8 h-8 rounded-full bg-gray-300 font-bold text-white flex items-center justify-center text-sm flex-shrink-0">
                  ME
                </div>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={commentInputs[post.id] || ''}
                    onChange={(e) => handleCommentChange(post.id, e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCommentSubmit(post.id)}
                      placeholder={language === "RU" ? "Напишите комментарий..." : "Write a comment..."}
                    className="w-full bg-gray-100 border-transparent rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                  />
                  <button
                    onClick={() => handleCommentSubmit(post.id)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Toaster />

      <Dialog open={isCreatePostOpen} onOpenChange={setIsCreatePostOpen}>
        <DialogContent className="max-w-lg rounded-3xl p-6 border-0 app-shadow">
          <DialogHeader>
            <DialogTitle className="font-black tracking-tight text-xl">
              {language === "RU" ? "Создать пост" : "Create post"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground font-medium pt-1">
              {language === "RU"
                ? "Опубликуйте новый пост в ленте «Футбол»."
                : "Publish a new post in the «Football» feed."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 pt-4">
            <div className="space-y-2">
              <Label htmlFor="post-text" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">
                {language === "RU" ? "Текст поста" : "Post text"}
              </Label>
              <Textarea
                id="post-text"
                value={newPostText}
                onChange={(e) => setNewPostText(e.target.value)}
                className="rounded-xl bg-muted/50 border-0 min-h-[80px]"
                placeholder={language === "RU" ? "Напишите что-нибудь..." : "Write something..."}
              />
            </div>
            <PostImageUploader
              images={newPostImages}
              setImages={setNewPostImages}
              newPostImageUrls={newPostImageUrls}
              setNewPostImageUrls={setNewPostImageUrls}
            />
          </div>

          <DialogFooter className="pt-6">
            <Button
              onClick={handleCreatePost}
              className="w-full h-12 rounded-xl gradient-bg text-white font-black uppercase tracking-widest shadow-lg shadow-primary/20 border-0"
            >
              {language === "RU" ? "Опубликовать" : "Publish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

