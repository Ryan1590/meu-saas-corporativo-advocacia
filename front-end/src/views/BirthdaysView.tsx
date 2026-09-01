import React, { useEffect, useState } from 'react';
import { Cake, CalendarDays } from 'lucide-react';
import { Card } from '../components/design-system/Badge';
import { Avatar } from '../components/design-system/Badge';
import { Skeleton } from '../components/design-system/Tabs';
import { useAuth } from '../context/AuthContext';
import { ForbiddenShield } from './ForbiddenView';

interface BirthdayPerson {
  id: string;
  name: string;
  avatar?: string;
  role: string;
  age: number;
  birthdayDay: number;
}

interface BirthdayData {
  currentMonth: BirthdayPerson[];
  nextMonth: BirthdayPerson[];
  currentMonthLabel: string;
  nextMonthLabel: string;
}

const monthNames = [
  'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const getMonthLabel = (offset: number) => {
  const date = new Date();
  date.setMonth(date.getMonth() + offset);
  return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
};

const BirthdayList: React.FC<{ people: BirthdayPerson[]; emptyMessage: string }> = ({ people, emptyMessage }) => (
  <div className="divide-y divide-slate-100 dark:divide-slate-800">
    {people.length === 0 ? (
      <div className="px-5 py-10 text-center text-xs text-slate-500 dark:text-slate-400">{emptyMessage}</div>
    ) : people.map((person) => (
      <div key={person.id} className="grid grid-cols-[1fr_1fr_auto] items-center gap-4 px-5 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar name={person.name} src={person.avatar} size="sm" />
          <span className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{person.name}</span>
        </div>
        <span className="truncate text-xs text-slate-600 dark:text-slate-300">{person.role}</span>
        <div className="flex items-center gap-3 text-right">
          <span className="whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">{person.age} anos</span>
          <span className="flex min-w-8 items-center justify-center gap-1 rounded-md bg-indigo-50 px-2 py-1 text-xs font-bold text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
            <CalendarDays className="h-3 w-3" />
            {person.birthdayDay}
          </span>
        </div>
      </div>
    ))}
  </div>
);

export const BirthdaysView: React.FC = () => {
  const { can } = useAuth();
  const [data, setData] = useState<BirthdayData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/birthdays')
      .then((response) => response.json())
      .then((json) => {
        if (json.success) setData(json.data);
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (!can('birthdays.view')) {
    return <ForbiddenShield requiredPermission="birthdays.view" message="Seu perfil não possui permissão para visualizar os aniversariantes." />;
  }

  if (isLoading || !data) {
    return <Skeleton className="h-80 rounded-xl" />;
  }

  return (
    <div className="space-y-6 text-left">
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-300">
            <Cake className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Aniversariantes</h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Acompanhe os aniversários dos usuários da organização.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title={data.currentMonthLabel || getMonthLabel(0)} subtitle="Aniversários do mês atual">
          <BirthdayList people={data.currentMonth} emptyMessage="Nenhum aniversariante neste mês." />
        </Card>
        <Card title={data.nextMonthLabel || getMonthLabel(1)} subtitle="Aniversários do próximo mês">
          <BirthdayList people={data.nextMonth} emptyMessage="Nenhum aniversariante no próximo mês." />
        </Card>
      </div>
    </div>
  );
};