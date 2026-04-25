import { useState, useMemo, useCallback, memo, useEffect } from "react";
import { useRouter } from "@/shims/next-navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "@/shims/next-image";
import { MoreHorizontal, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/language-context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const INITIAL_USERS = [
    { id: 1, name: 'Анна', age: 24, img: PlaceHolderImages[0].imageUrl, email: 'anna@example.com', online: true, city: 'Москва', joined: '2024-05-01', bio: 'Люблю закаты, хороший кофе и интересные разговоры.', interests: ["Фотография", "Путешествия", "Кофе"] },
    { id: 2, name: 'Максим', age: 28, img: PlaceHolderImages[1].imageUrl, email: 'maxim@example.com', online: true, city: 'Питер', joined: '2024-05-02', bio: 'Путешественник и фотограф.', interests: ["Спорт", "Авто"] },
    { id: 3, name: 'Елена', age: 26, img: PlaceHolderImages[2].imageUrl, email: 'elena@example.com', online: false, city: 'Москва', joined: '2024-04-28', bio: 'Ищу вдохновение в книгах и искусстве.', interests: ["Искусство", "Чтение"] },
    { id: 4, name: 'Дмитрий', age: 31, img: PlaceHolderImages[3].imageUrl, email: 'dmitry@example.com', online: false, city: 'Казань', joined: '2024-04-25', bio: 'Программист, который любит готовить.', interests: ["IT технологии", "Кулинария"] },
    { id: 5, name: 'София', age: 22, img: PlaceHolderImages[4].imageUrl, email: 'sophia@example.com', online: true, city: 'Москва', joined: '2024-05-05', bio: 'Музыка - моя жизнь.', interests: ["Музыка", "Творчество"] },
    { id: 6, name: 'Артем', age: 25, img: PlaceHolderImages[5].imageUrl, email: 'artem@example.com', online: true, city: 'Питер', joined: '2024-05-04', bio: 'Спорт, технологии и ничего лишнего.', interests: ["Спорт", "IT технологии"] },
    { id: 7, name: 'Мария', age: 29, img: PlaceHolderImages[6].imageUrl, email: 'maria@example.com', online: true, city: 'Москва', joined: '2024-05-03', bio: 'Йога, природа и саморазвитие.', interests: ["Йога", "Природа"] },
];

type User = typeof INITIAL_USERS[0];

// Memoized Row Component for better performance
const UserRow = memo(({ user, onEdit, onDelete, onViewProfile, t }: { 
  user: User; 
  onEdit: (user: User) => void; 
  onDelete: (id: number, name: string) => void;
  onViewProfile: (id: number) => void;
  t: (key: string) => string;
}) => (
  <TableRow className="group transition-colors">
    <TableCell className="hidden sm:table-cell">
      <div className="relative w-10 h-10 rounded-full overflow-hidden border border-border">
        <Image
          alt={user.name}
          src={user.img}
          fill
          sizes="40px"
          className="object-cover"
        />
      </div>
    </TableCell>
    <TableCell className="font-bold">{user.name}</TableCell>
    <TableCell className="hidden md:table-cell text-muted-foreground text-xs">{user.email}</TableCell>
    <TableCell>
      <Badge variant={user.online ? "default" : "outline"} className={user.online ? "bg-[#2ecc71] hover:bg-[#27ae60] text-white border-transparent text-[10px]" : "text-[10px]"}>
        {user.online ? "Online" : "Offline"}
      </Badge>
    </TableCell>
    <TableCell className="hidden md:table-cell text-xs">{user.city}</TableCell>
    <TableCell className="hidden md:table-cell text-xs opacity-60">{user.joined}</TableCell>
    <TableCell className="text-right">
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <button className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-muted transition-colors">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Toggle menu</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="rounded-xl">
          <DropdownMenuLabel>{t('admin.actions')}</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => onViewProfile(user.id)}>{t('admin.view_profile')}</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onEdit(user)}>Edit</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onDelete(user.id, user.name)} className="text-destructive focus:text-destructive">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </TableCell>
  </TableRow>
));
UserRow.displayName = "UserRow";

// Memoized Edit Dialog Component
const UserEditDialog = memo(({ isOpen, onOpenChange, user, onSave, t }: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onSave: (user: User) => void;
  t: (key: string) => string;
}) => {
  const [editedUser, setEditedUser] = useState<User | null>(null);

  // Use effect to sync local state with prop
  useEffect(() => {
    if (user) {
      setEditedUser(user);
    }
  }, [user]);

  if (!editedUser) return null;

  const removeInterest = (interest: string) => {
    setEditedUser({
      ...editedUser,
      interests: editedUser.interests.filter(i => i !== interest)
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Редактировать пользователя</DialogTitle>
          <DialogDescription>
            Измените данные для {editedUser.name}. Нажмите сохранить, когда закончите.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-name" className="text-right font-bold text-xs uppercase tracking-widest text-muted-foreground">
              Имя
            </Label>
            <Input
              id="edit-name"
              value={editedUser.name}
              onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
              className="col-span-3 rounded-xl"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-age" className="text-right font-bold text-xs uppercase tracking-widest text-muted-foreground">
              Возраст
            </Label>
            <Input
              id="edit-age"
              type="number"
              value={editedUser.age}
              onChange={(e) => setEditedUser({ ...editedUser, age: parseInt(e.target.value) || 0 })}
              className="col-span-3 rounded-xl"
            />
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-city" className="text-right font-bold text-xs uppercase tracking-widest text-muted-foreground">
              Город
            </Label>
            <Input
              id="edit-city"
              value={editedUser.city}
              onChange={(e) => setEditedUser({ ...editedUser, city: e.target.value })}
              className="col-span-3 rounded-xl"
            />
          </div>
           <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="edit-bio" className="text-right pt-2 font-bold text-xs uppercase tracking-widest text-muted-foreground">
              Био
            </Label>
            <Textarea
              id="edit-bio"
              value={editedUser.bio}
              onChange={(e) => setEditedUser({ ...editedUser, bio: e.target.value })}
              className="col-span-3 min-h-[80px] rounded-xl"
            />
          </div>
          
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2 font-bold text-xs uppercase tracking-widest text-muted-foreground">
              Интересы
            </Label>
            <div className="col-span-3 flex flex-wrap gap-2 pt-1">
              {editedUser.interests.map((interest) => (
                <Badge key={interest} variant="secondary" className="gap-1.5 py-1 px-2.5 font-bold text-[10px] rounded-lg bg-muted/50 border-0">
                  {interest}
                  <button onClick={() => removeInterest(interest)} className="text-muted-foreground hover:text-destructive transition-colors">
                    <X size={12} />
                  </button>
                </Badge>
              ))}
              {editedUser.interests.length === 0 && <p className="text-[10px] text-muted-foreground italic">Список пуст</p>}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" onClick={() => onSave(editedUser)} className="w-full rounded-xl gradient-bg text-white font-black uppercase tracking-widest shadow-lg border-0">Сохранить изменения</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});
UserEditDialog.displayName = "UserEditDialog";

export default function AdminUsersPage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [users, setUsers] = useState(INITIAL_USERS);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleDeleteUser = useCallback((userId: number, userName: string) => {
    setUsers(prev => prev.filter(user => user.id !== userId));
    toast({
      variant: "destructive",
      title: language === 'RU' ? "Пользователь удален" : "User deleted",
      description: `${userName} ${language === 'RU' ? 'был удален из системы' : 'has been removed'}.`,
    });
  }, [language]);

  const handleEditClick = useCallback((user: User) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  }, []);

  const handleSaveUser = useCallback((updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    setIsEditDialogOpen(false);
    toast({
        title: "Пользователь обновлен",
        description: `Данные для ${updatedUser.name} были успешно сохранены.`,
    });
  }, []);

  const handleViewProfile = useCallback((id: number) => {
    router.push(`/user?id=${id}`);
  }, [router]);

  const usersList = useMemo(() => users, [users]);

  return (
    <>
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-black">{t('admin.users')}</CardTitle>
        <CardDescription>{t('admin.manage_users')}</CardDescription>
      </CardHeader>
      <CardContent className="p-0 sm:p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden w-[80px] sm:table-cell">{t('admin.user_image')}</TableHead>
              <TableHead>{t('admin.user_name')}</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead>{t('admin.status')}</TableHead>
              <TableHead className="hidden md:table-cell">{t('admin.city')}</TableHead>
              <TableHead className="hidden md:table-cell">{t('admin.joined')}</TableHead>
              <TableHead className="text-right">{t('admin.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usersList.map(user => (
              <UserRow 
                key={user.id} 
                user={user} 
                onEdit={handleEditClick} 
                onDelete={handleDeleteUser} 
                onViewProfile={handleViewProfile}
                t={t} 
              />
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="bg-muted/5 border-t">
        <div className="text-[10px] uppercase font-black tracking-widest text-muted-foreground py-2">
          Total: <strong>{usersList.length}</strong> {language === 'RU' ? 'пользователей' : 'users'}
        </div>
      </CardFooter>
    </Card>

    <UserEditDialog 
      isOpen={isEditDialogOpen}
      onOpenChange={setIsEditDialogOpen}
      user={selectedUser}
      onSave={handleSaveUser}
      t={t}
    />
    </>
  );
}
