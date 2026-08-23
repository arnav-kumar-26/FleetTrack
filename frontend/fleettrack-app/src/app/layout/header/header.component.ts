import { ChangeDetectionStrategy, Component, Input, signal } from '@angular/core';
import { LucideDynamicIcon } from '@lucide/angular';
import { AuthUser } from '../../core/models/auth.model';
import { AvatarComponent } from '../../shared/ui/avatar/avatar.component';

export interface HeaderMessage {
  title: string;
  body?: string;
}

export interface HeaderNotification {
  title: string;
  body?: string;
}

type HeaderMenu = 'messages' | 'notifications';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [LucideDynamicIcon, AvatarComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  @Input() currentUser: AuthUser | null = null;
  @Input() initials = '';
  @Input() messages: HeaderMessage[] = [];
  @Input() notifications: HeaderNotification[] = [];

  readonly openMenu = signal<HeaderMenu | null>(null);

  toggleMenu(menu: HeaderMenu) {
    this.openMenu.update((current) => (current === menu ? null : menu));
  }

  closeMenu() {
    this.openMenu.set(null);
  }
}