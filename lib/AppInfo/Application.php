<?php

declare(strict_types=1);

/**
 * @copyright Copyright (c) 2021-2022 Andrey Borysenko <andrey18106x@gmail.com>
 *
 * @copyright Copyright (c) 2021-2022 Alexander Piskun <bigcat88@icloud.com>
 *
 * @author 2021-2022 Andrey Borysenko <andrey18106x@gmail.com>
 *
 * @license AGPL-3.0-or-later
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

namespace OCA\MediaDC\AppInfo;

use OCA\Files\Event\LoadAdditionalScriptsEvent;
use OCA\MediaDC\Dashboard\RecentTasksWidget;
use OCA\MediaDC\Listener\LoadFilesPluginListener;
use OCA\MediaDC\Notification\Notifier;
use OCP\AppFramework\App;
use OCP\AppFramework\Bootstrap\IBootContext;

use OCP\AppFramework\Bootstrap\IBootstrap;
use OCP\AppFramework\Bootstrap\IRegistrationContext;

class Application extends App implements IBootstrap {
	public const APP_ID = 'mediadc';
	/**
	 * Upstream release whose pre-compiled Python binaries are used.
	 * The fork does not publish binaries, and its Python part is unchanged since v0.4.0.
	 */
	public const PYTHON_BINARY_VERSION = '0.4.0';
	/**
	 * Pinned sha256 of the PYTHON_BINARY_VERSION release archives, keyed by binary name.
	 * Downloads that do not match are rejected before extraction.
	 */
	public const PYTHON_BINARY_SHA256 = [
		'manylinux_amd64' => '9aac6576eadd6ef8240e4f418c80cefe054aee2bbe4a2a931053f5ff8494f24a',
		'manylinux_arm64' => '75f13724a266f69b5af7a811d9f14e4f90b10ee21e1efc114ff182bd559b2da2',
		'musllinux_amd64' => '7786357a084e180cda85b51498297f90095d01d8f3156ceb024d811e15f42ce2',
		'musllinux_arm64' => '186692ba64b15c8fca1a2655911932d162b3822eb2ce2cbcd19fdc39946d2451',
	];

	public function __construct() {
		parent::__construct(self::APP_ID);
	}

	public function register(IRegistrationContext $context): void {
		$context->registerDashboardWidget(RecentTasksWidget::class);
		$context->registerNotifierService(Notifier::class);
		$context->registerEventListener(LoadAdditionalScriptsEvent::class, LoadFilesPluginListener::class);
	}

	public function boot(IBootContext $context): void {
	}
}
