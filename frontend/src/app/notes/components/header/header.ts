import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { AuthService } from '../../../auth/service/auth-service';
import { Router } from '@angular/router';

@Component({
  selector: 'notes-header',
  imports: [],
  templateUrl: './header.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {
  authService = inject(AuthService);
  router = inject(Router);
  user = computed(() => this.authService.user());

  logout() {
    this.authService.logout();
    this.router.navigateByUrl('/auth/login');
  }
}
