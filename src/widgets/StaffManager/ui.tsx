import React, { useState } from 'react';
import { useGetQuery, useMutationQuery } from '@shared/api/hooks/index.js';
import { useHaptic, useToast } from '@shared/lib/hooks/index.js';
import { Skeleton } from '@shared/ui/Skeleton/index.js';
import { BottomSheet } from '@shared/ui/BottomSheet/index.js';
import './style.css';

interface IStaffMember {
  _id: string;
  name: string;
  phone: string;
  role: string;
}

interface IStaffManagerProps {
  restaurantId: string;
}

interface IStaffForm {
  name: string;
  phone: string;
  password?: string;
  role: string;
  pin?: string;
}

export const StaffManager = ({ restaurantId }: IStaffManagerProps) => {
  const { trigger } = useHaptic();
  const toast = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<IStaffMember | null>(null);
  const [formData, setFormData] = useState<IStaffForm>({ name: '', phone: '', password: '', role: 'waiter', pin: '' });

  const { data: staff, isLoading, refetch } = useGetQuery<IStaffMember[]>(
    ['staff', restaurantId],
    `/api/users/restaurant/${restaurantId}`,
    {},
    { useMock: true }
  );

  const mutation = useMutationQuery({
    onSuccess: () => {
      toast.success(editingMember ? 'Данные обновлены! ✨' : 'Сотрудник добавлен! 🎉');
      setIsModalOpen(false);
      setEditingMember(null);
      setFormData({ name: '', phone: '', password: '', role: 'waiter', pin: '' });
      refetch();
    },
    onError: (err: any) => {
      toast.error(err.message || 'Ошибка операции');
    }
  });

  const handleEdit = (member: IStaffMember) => {
    setEditingMember(member);
    setFormData({ 
      name: member.name, 
      phone: member.phone, 
      password: '', // Пароль не показываем
      role: member.role,
      pin: '' // ПИН тоже не показываем
    });
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    setEditingMember(null);
    setFormData({ name: '', phone: '', password: '', role: 'waiter', pin: '' });
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.phone || (!editingMember && !formData.password)) {
      return toast.info('Заполните обязательные поля');
    }
    
    // ПИН должен быть 4 цифры
    if (formData.pin && formData.pin.length !== 4) {
      return toast.info('ПИН должен быть ровно 4 цифры');
    }

    trigger('medium');

    if (editingMember) {
      mutation.mutate({
        url: `/api/users/${editingMember._id}`,
        method: 'PATCH',
        data: formData
      });
    } else {
      mutation.mutate({
        url: '/api/users/staff',
        method: 'POST',
        data: formData
      });
    }
  };

  const handleDelete = (id: string) => {
    trigger('heavy');
    mutation.mutate({
      url: `/api/users/${id}`,
      method: 'DELETE'
    });
  };

  const ROLE_NAMES: Record<string, string> = {
    admin: '👑 Владелец',
    manager: '🔑 Менеджер',
    chef: '👨‍🍳 Повар',
    waiter: '🏃 Официант',
    cashier: '💰 Кассир'
  };

  const hasManager = staff?.some(s => s.role === 'manager');

  return (
    <view className="staff-manager">
      <view className="staff-manager__header">
        <text className="staff-manager__title">Команда заведения</text>
        <view className="staff-manager__add-btn" bindtap={handleAddClick}>
          <text className="staff-manager__add-icon">+</text>
        </view>
      </view>

      <scroll-view className="staff-manager__list" scroll-y>
        {isLoading ? (
          [1, 2, 3].map(i => <Skeleton key={i} height="70px" className="staff-manager__skeleton" />)
        ) : (
          staff?.map(member => (
            <view key={member._id} className="staff-card">
              <view className="staff-card__info" bindtap={() => handleEdit(member)}>
                <text className="staff-card__name">{member.name}</text>
                <text className="staff-card__role">{ROLE_NAMES[member.role] || member.role}</text>
              </view>
              
              <view className="staff-card__actions">
                <view className="staff-card__btn staff-card__btn--edit" bindtap={() => handleEdit(member)}>
                  <text className="staff-card__btn-icon">✏️</text>
                </view>
                {member.role !== 'admin' && (
                  <view className="staff-card__btn staff-card__btn--delete" bindtap={() => handleDelete(member._id)}>
                    <text className="staff-card__btn-icon">🗑</text>
                  </view>
                )}
              </view>
            </view>
          ))
        )}
      </scroll-view>

      <BottomSheet 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
      >
        <view className="add-staff">
          <text className="add-staff__title">{editingMember ? 'Редактировать' : 'Новый сотрудник'}</text>
          
          <text className="add-staff__label">ФИО</text>
          <input className="add-staff__input" value={formData.name} bindinput={(e: any) => setFormData({...formData, name: e.detail.value})} placeholder="Иван Иванов" />
          
          <text className="add-staff__label">Телефон</text>
          <input className="add-staff__input" value={formData.phone} bindinput={(e: any) => setFormData({...formData, phone: e.detail.value})} placeholder="992..." />
          
          <text className="add-staff__label">Пароль {editingMember && '(оставьте пустым, если не меняете)'}</text>
          <input className="add-staff__input" value={formData.password} bindinput={(e: any) => setFormData({...formData, password: e.detail.value})} placeholder="******" password />

          <text className="add-staff__label">Должность</text>
          <view className="add-staff__roles">
            {['waiter', 'chef', 'cashier', 'manager'].map(role => {
              // Если мы редактируем текущего менеджера, то роль доступна
              const isCurrentManager = editingMember?.role === 'manager' && role === 'manager';
              const isDisabled = role === 'manager' && hasManager && !isCurrentManager;
              
              return (
                <view 
                  key={role} 
                  className={`role-chip ${formData.role === role ? 'role-chip--active' : ''} ${isDisabled ? 'role-chip--disabled' : ''}`}
                  bindtap={() => !isDisabled && setFormData({...formData, role})}
                >
                  <text className="role-chip__text">{ROLE_NAMES[role]?.replace(/.* /, '')}</text>
                </view>
              );
            })}
          </view>
          {hasManager && editingMember?.role !== 'manager' && <text className="add-staff__hint">⚠️ Место менеджера занято</text>}

          <view className="add-staff__submit" bindtap={handleSubmit}>
            <text className="add-staff__submit-text">
              {editingMember ? 'Сохранить изменения' : 'Создать аккаунт'}
            </text>
          </view>
        </view>
      </BottomSheet>
    </view>
  );
};
