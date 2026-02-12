'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
    Book,
    ChevronRight,
    Crown,
    FileText,
    Gavel,
    Info,
    ShieldAlert,
    ShieldCheck,
    Target,
    TrendingUp,
    Zap
} from 'lucide-react';
import { useState } from 'react';

const SECTIONS = [
    { id: 'rules', label: 'Устав Семьи', icon: Gavel },
    { id: 'hierarchy', label: 'Иерархия', icon: Crown },
    { id: 'promotion', label: 'Повышение', icon: TrendingUp },
    { id: 'contracts', label: 'Контракты', icon: FileText },
];

export default function WikiPage() {
    const [activeSection, setActiveSection] = useState('rules');

    return (
        <div className="w-full space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight mb-2 flex items-center gap-3">
                        <Book className="w-8 h-8 text-[#e81c5a]" />
                        База знаний
                    </h1>
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">
                        Всё, что нужно знать члену семьи Shelby
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 items-start">
                
                {/* Navigation Sidebar */}
                <div className="space-y-2 lg:sticky lg:top-8">
                    {SECTIONS.map((section) => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={`w-full flex items-center justify-between p-4 rounded-xl transition-all duration-300 group ${
                                activeSection === section.id 
                                    ? 'bg-[#e81c5a] text-white shadow-lg shadow-[#e81c5a]/20 translate-x-1' 
                                    : 'bg-white/5 text-gray-500 hover:bg-white/10 hover:text-white'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <section.icon className={`w-5 h-5 ${activeSection === section.id ? 'text-white' : 'text-gray-500 group-hover:text-white'} transition-colors`} />
                                <span className="font-black text-xs uppercase tracking-widest">{section.label}</span>
                            </div>
                            <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${activeSection === section.id ? 'translate-x-0' : '-translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0'}`} />
                        </button>
                    ))}

                    <div className="mt-8 p-6 rounded-2xl bg-linear-to-br from-[#e81c5a]/20 to-transparent border border-[#e81c5a]/20">
                        <ShieldAlert className="w-6 h-6 text-[#e81c5a] mb-3" />
                        <p className="text-[10px] font-black text-white uppercase tracking-widest mb-2 leading-relaxed">
                            Нашли ошибку в уставе?
                        </p>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 leading-relaxed">
                            Свяжитесь с лидером или заместителем лидера.
                        </p>
                        <Button variant="outline" className="w-full text-[10px] font-black uppercase tracking-widest h-8 border-[#e81c5a]/30 hover:bg-[#e81c5a]/10 hover:border-[#e81c5a] text-white">
                            Сообщить
                        </Button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                    
                    {activeSection === 'rules' && (
                        <div className="space-y-6">
                            <Card className="bg-[#0a0a0a] border-white/10 overflow-hidden">
                                <div className="h-1 bg-[#e81c5a]" />
                                <CardContent className="p-8">
                                    <h2 className="text-2xl font-black text-white mb-6 uppercase tracking-tight flex items-center gap-3">
                                        <ShieldCheck className="w-6 h-6 text-green-500" />
                                        Основной устав
                                    </h2>
                                    <div className="space-y-6">
                                        {[
                                            { title: 'Лояльность', text: 'Интересы семьи превыше личных. Любое проявление предательства ведет к немедленному исключению.' },
                                            { title: 'Дисциплина', text: 'Приказы руководства (Ранг 8+) не обсуждаются. Обращение по имени разрешено только с равными по рангу или ниже.' },
                                            { title: 'Рация', text: 'Запрещено засорять эфир (ООС, спам, музыка). Используйте рацию только по делу.' },
                                            { title: 'Автопарк', text: 'Верните транспорт в исправном состоянии и заправленным. Не оставляйте машины брошенными.' }
                                        ].map((rule, i) => (
                                            <div key={rule.title} className="flex gap-4 group">
                                                <div className="flex flex-col items-center">
                                                    <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-black text-xs text-[#e81c5a]">
                                                        {i + 1}
                                                    </div>
                                                    <div className="w-px h-full bg-white/5 mt-2" />
                                                </div>
                                                <div className="pb-6">
                                                    <h4 className="text-xs font-black text-white uppercase tracking-widest mb-2 group-hover:text-[#e81c5a] transition-colors">{rule.title}</h4>
                                                    <p className="text-sm font-medium text-gray-500 leading-relaxed uppercase tracking-wider text-[11px]">{rule.text}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/10">
                                    <h4 className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <ShieldAlert className="w-3.5 h-3.5" />
                                        Строго запрещено
                                    </h4>
                                    <ul className="space-y-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest list-disc pl-4">
                                        <li>Оскорблять членов семьи</li>
                                        <li>Сливать информацию конкурентам</li>
                                        <li>Просить ранг без отчета</li>
                                    </ul>
                                </div>
                                <div className="p-6 rounded-2xl bg-green-500/5 border border-green-500/10">
                                    <h4 className="text-[10px] font-black text-green-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <Zap className="w-3.5 h-3.5" />
                                        Приветствуется
                                    </h4>
                                    <ul className="space-y-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest list-disc pl-4">
                                        <li>Помощь новичкам</li>
                                        <li>Участие в жизни семьи</li>
                                        <li>Пополнение склада</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'hierarchy' && (
                        <div className="space-y-6">
                            <Card className="bg-[#0a0a0a] border-white/10">
                                <CardContent className="p-8">
                                    <div className="flex items-center justify-between mb-8">
                                        <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                                            <Crown className="w-6 h-6 text-yellow-500" />
                                            Структура власти
                                        </h2>
                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">10 Уровней</span>
                                    </div>
                                    <div className="space-y-8">
                                        {[
                                            { 
                                                title: "Руководство", 
                                                color: "bg-red-500/20", 
                                                ranks: [
                                                    { id: 10, name: "Глава семьи", color: "text-red-500", bg: "bg-red-500/10", req: "—", perms: "Главный руководитель. Полный контроль." },
                                                    { id: 9, name: "Заместитель главы", color: "text-yellow-500", bg: "bg-yellow-500/10", req: "Доверие", perms: "Правая рука главы. Координация." },
                                                ]
                                            },
                                            { 
                                                title: "Управление", 
                                                color: "bg-cyan-500/20", 
                                                ranks: [
                                                    { id: 8, name: "Старшее руководство", color: "text-cyan-500", bg: "bg-cyan-500/10", req: "Назначение", perms: "Контроль дисциплины. Доступ к сейфу." },
                                                    { id: 7, name: "Руководитель направлений", color: "text-cyan-500", bg: "bg-cyan-500/10", req: "Назначение", perms: "Контракты, фарм, актив и экономика." },
                                                ]
                                            },
                                            { 
                                                title: "Основной состав", 
                                                color: "bg-green-500/20", 
                                                ranks: [
                                                    { id: 6, name: "Старший состава", color: "text-green-500", bg: "bg-green-500/10", req: "Активность", perms: "Наставник. Помощь руководству." },
                                                    { id: 5, name: "Основной состав", color: "text-green-500", bg: "bg-green-500/10", req: "Контракты и Актив", perms: "Фундамент семьи. Регулярные контракты." },
                                                    { id: 4, name: "Младший состав", color: "text-green-500", bg: "bg-green-500/10", req: "Контракты", perms: "Начальный рабочий уровень. Помощь." },
                                                ]
                                            },
                                            { 
                                                title: "Начинающий", 
                                                color: "bg-blue-500/20", 
                                                ranks: [
                                                    { id: 3, name: "Рекрутер", color: "text-orange-500", bg: "bg-orange-500/10", req: "Фамилия Shelby", perms: "Поиск и приглашение новых людей." },
                                                    { id: 2, name: "Стажёр", color: "text-blue-500", bg: "bg-blue-500/10", req: "Знание правил", perms: "Испытательный срок. Базовые задачи." },
                                                    { id: 1, name: "Кандидат", color: "text-emerald-500", bg: "bg-emerald-500/10", req: "Вступление", perms: "Минимальные права. Проверка." },
                                                ]
                                            },
                                        ].map((tier) => (
                                            <div key={tier.title} className="space-y-3">
                                                <div className="flex items-center gap-3 px-1">
                                                    <div className={cn("w-1 h-3 rounded-full", tier.color)} />
                                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">{tier.title}</h3>
                                                </div>
                                                <div className="grid grid-cols-1 gap-2">
                                                    {tier.ranks.map((rank) => (
                                                        <div key={rank.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-white/2 border border-white/5 hover:border-white/10 transition-all group">
                                                            <div className={cn("w-10 h-10 rounded border border-white/5 flex items-center justify-center font-bold text-lg shrink-0", rank.bg, rank.color)}>
                                                                {rank.id}
                                                            </div>
                                                            <div className="flex-1">
                                                                <h4 className={cn("font-bold text-sm tracking-tight", rank.color)}>{rank.name}</h4>
                                                                <p className="text-[11px] text-gray-500 uppercase tracking-widest font-bold">{rank.perms}</p>
                                                            </div>
                                                            <div className="text-right shrink-0 sm:border-l sm:border-white/5 sm:pl-6">
                                                                <span className="text-[8px] text-gray-600 uppercase tracking-widest block mb-0.5">Требование</span>
                                                                <span className="text-[10px] text-gray-400 font-bold uppercase">{rank.req}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {activeSection === 'promotion' && (
                        <div className="space-y-6">
                            <Card className="bg-[#0a0a0a] border-white/10">
                                <CardContent className="p-8">
                                    <h2 className="text-2xl font-black text-white mb-8 uppercase tracking-tight flex items-center gap-3">
                                        <TrendingUp className="w-6 h-6 text-[#e81c5a]" />
                                        Система повышений
                                    </h2>
                                    <div className="space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            {[
                                                { icon: ShieldCheck, text: "Активность", desc: "Участие в жизни семьи." },
                                                { icon: Zap, text: "Вклад", desc: "Контракты и ресурсы." },
                                                { icon: ShieldAlert, text: "Дисциплина", desc: "Соблюдение устава." }
                                            ].map((item, idx) => (
                                                <div key={idx} className="flex gap-4 p-4 rounded-xl bg-white/2 border border-white/5">
                                                    <div className="w-10 h-10 rounded-lg bg-[#e81c5a]/10 flex items-center justify-center shrink-0">
                                                        <item.icon className="w-5 h-5 text-[#e81c5a]" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-black text-white uppercase tracking-widest leading-none mb-1">{item.text}</p>
                                                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest leading-tight">{item.desc}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="p-6 rounded-2xl bg-orange-500/5 border border-orange-500/10 space-y-4">
                                            <div className="flex items-center gap-2">
                                                <ShieldAlert className="w-4 h-4 text-orange-500" />
                                                <h4 className="text-[11px] font-black uppercase tracking-widest text-orange-500">Важные правила</h4>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                                                {[
                                                    "Ранги не покупаются и не выпрашиваются.",
                                                    "Выпрашивание может привести к выговору.",
                                                    "Повышение только после подтверждения Hight рангов.",
                                                    "Переход на 6+ ранг — только с подтверждением 8+ ранга."
                                                ].map((rule, idx) => (
                                                    <div key={idx} className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-relaxed flex gap-3">
                                                        <span className="text-orange-500/50 shrink-0">•</span>
                                                        {rule}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="relative pl-8 border-l-2 border-[#e81c5a]/20 space-y-12 mt-8">
                                            {[
                                                { step: '1 → 2', title: 'Вступление', tasks: ['Сдать устав (Ранг 8+)', 'Выполнить 2 любых контракта', 'Принять участие в 1 мероприятии'] },
                                                { step: '2 → 4', title: 'Активный боец', tasks: ['Выполнить 10 контрактов суммарно', 'Общая сумма заработка $50,000+', 'Наличие Discord и RolePlay ника'] },
                                                { step: '4 → 6', title: 'Проверенный', tasks: ['40+ выполненных контрактов', 'Репутация XP семьи 2500+', 'Одобрение Главы отдела'] }
                                            ].map((item) => (
                                                <div key={item.step} className="relative">
                                                    <div className="absolute -left-[41px] top-0 w-5 h-5 rounded-full bg-[#e81c5a] border-4 border-[#0a0a0a]" />
                                                    <div className="flex items-center gap-4 mb-4">
                                                        <span className="text-lg font-black text-white uppercase tracking-tighter">{item.step}</span>
                                                        <div className="h-px w-8 bg-white/10" />
                                                        <span className="text-xs font-black text-[#e81c5a] uppercase tracking-widest">{item.title}</span>
                                                    </div>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                        {item.tasks.map((task) => (
                                                            <div key={task} className="flex items-center gap-3 p-3 rounded-xl bg-white/2 border border-white/5">
                                                                <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                                                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{task}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="p-6 rounded-2xl bg-yellow-500/5 border border-yellow-500/10 flex items-start gap-4">
                                            <Info className="w-5 h-5 text-yellow-500 shrink-0" />
                                            <div>
                                                <h5 className="text-[11px] font-black text-white uppercase tracking-widest mb-1">Повышение с 7 на 8 ранг</h5>
                                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-relaxed">
                                                    Ранг 8 и выше выдается исключительно по решению Лидера семьи за выдающиеся заслуги. Прямых требований по отчетам нет.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {activeSection === 'contracts' && (
                        <div className="space-y-6">
                            <Card className="bg-[#0a0a0a] border-white/10">
                                <CardContent className="p-8">
                                    <h2 className="text-2xl font-black text-white mb-8 uppercase tracking-tight flex items-center gap-3">
                                        <FileText className="w-6 h-6 text-blue-500" />
                                        Работа и отчетность
                                    </h2>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                        <div className="text-center p-6 rounded-2xl bg-white/2 border border-white/5">
                                            <Target className="w-8 h-8 text-green-500 mx-auto mb-3" />
                                            <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-1">Возьмите</h4>
                                            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Выберите активный контракт</p>
                                        </div>
                                        <div className="text-center p-6 rounded-2xl bg-white/2 border border-white/5">
                                            <Zap className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
                                            <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-1">Сделайте</h4>
                                            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Выполните условия (скрины/видео)</p>
                                        </div>
                                        <div className="text-center p-6 rounded-2xl bg-white/2 border border-white/5">
                                            <ShieldCheck className="w-8 h-8 text-blue-500 mx-auto mb-3" />
                                            <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-1">Получите</h4>
                                            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Награда падает после проверки</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-xs font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <Info className="w-4 h-4 text-[#e81c5a]" />
                                            Требования к доказательствам
                                        </h3>
                                        <div className="grid grid-cols-1 gap-3">
                                            {[
                                                'Скриншот или видео должно быть в высоком качестве (читаемо)',
                                                'На доказательствах должно быть видно текущее время и дату',
                                                'Срок годности доказательств - 24 часа с момента получения',
                                                'Запрещено использовать чужие доказательства (будет расценено как обман)',
                                                'При работе напарником, все участники должны быть видны'
                                            ].map((text) => (
                                                <div key={text} className="flex items-center gap-3 p-4 rounded-xl bg-white/1 border border-white/5">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-[#e81c5a]" />
                                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{text}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="p-8 rounded-3xl bg-linear-to-br from-[#e81c5a]/10 to-transparent border border-[#e81c5a]/10 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="space-y-2">
                                    <h3 className="text-xl font-black text-white uppercase tracking-tight">Готовы приступить?</h3>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Проверьте доступные контракты и начните зарабатывать</p>
                                </div>
                                <Button className="bg-[#e81c5a] hover:bg-[#c21548] text-white font-black uppercase tracking-widest px-8 h-12 shadow-lg shadow-[#e81c5a]/20">
                                    Перейти к контрактам
                                </Button>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
