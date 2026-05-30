import { Component, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props { children: ReactNode }
interface State { hasError: boolean; error: Error | null }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center px-6">
          <div className="glass bento-card max-w-sm w-full text-center space-y-4 py-10">
            <AlertTriangle size={40} className="text-destructive mx-auto" />
            <h2 className="text-card-title text-foreground">出了点问题</h2>
            <p className="text-micro text-muted-foreground break-all">
              {this.state.error?.message || '未知错误'}
            </p>
            <Button
              onClick={() => {
                this.setState({ hasError: false, error: null })
                window.location.href = '/'
              }}
              className="rounded-xl"
            >
              <RefreshCw size={16} className="mr-1" /> 返回首页
            </Button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
