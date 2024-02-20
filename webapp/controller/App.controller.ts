import Theming from 'sap/ui/core/Theming';
import '../model/app/AppState.service';
import '../model/task/TaskState.service';
import BaseController from './BaseController';

/**
 * @namespace com.github.dfenerski.native_state.controller
 */
export default class App extends BaseController {
    public onInit(): void {
        // Apply content density mode to root view
        this.getView().addStyleClass(
            this.getOwnerComponent().getContentDensityClass(),
        );
    }

    public handleThemeChange(theme: 'sap_horizon' | 'sap_horizon_dark'): void {
        Theming.setTheme(theme);
    }
}
