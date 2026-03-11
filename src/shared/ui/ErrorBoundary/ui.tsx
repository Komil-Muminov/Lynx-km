import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import './style.css';

interface IProps {
  children: ReactNode;
  fallback?: ReactNode;
  title?: string;
  className?: string;
}

interface IState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Предохранитель (Error Boundary).
 * Оборачивает виджеты и перехватывает ошибки рендеринга,
 * чтобы предотвратить падение (белый экран) всего приложения.
 */
export class ErrorBoundary extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): IState {
    // Обновляем состояние, чтобы следующий рендер показал fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // В реальном приложении здесь можно отправить ошибку в Sentry/Datadog
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    // Сброс состояния ошибки для попытки перерендера
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { title = 'Упс, блок сломался', className = '' } = this.props;

      // Fallback UI по умолчанию
      return (
        <view className={`error-boundary__container ${className}`}>
          <view className="error-boundary__content">
            <text className="error-boundary__icon">⚠️</text>
            <text className="error-boundary__title">{title}</text>
            <text className="error-boundary__subtitle">Возникла локальная ошибка.</text>
            <view className="error-boundary__btn press-effect" bindtap={this.handleReset}>
              <text className="error-boundary__btn-txt">Обновить модуль</text>
            </view>
          </view>
        </view>
      );
    }

    return this.props.children;
  }
}
