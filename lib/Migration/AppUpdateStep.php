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

namespace OCA\MediaDC\Migration;

use OCA\MediaDC\AppInfo\Application;
use OCA\MediaDC\Migration\data\AppInitialData;
use OCA\MediaDC\Migration\data\PythonSettingsInitialData;
use OCA\MediaDC\Service\AppDataService;
use OCA\MediaDC\Service\PythonUtilsService;
use OCA\MediaDC\Service\UtilsService;
use OCP\Migration\IOutput;
use OCP\Migration\IRepairStep;

class AppUpdateStep implements IRepairStep {
	public function __construct(
		private readonly UtilsService $utils,
		private readonly PythonUtilsService $pythonUtils,
		private readonly AppDataService $appDataService,
	) {
	}

	public function getName(): string {
		return 'Update settings and binaries along with MediaDC';
	}

	public function run(IOutput $output) {
		$output->startProgress(2);
		$output->advance(1, 'Sync settings changes');
		$this->utils->checkForSettingsUpdates(AppInitialData::$APP_INITIAL_DATA);
		$this->pythonUtils->ensureSettings(PythonSettingsInitialData::$PYTHON_SETTINGS_INITIAL_DATA);
		$output->advance(1, 'Update binaries (downloading pre-compiled binaries for this release)');
		$output->warning('This step may take some time');
		$this->appDataService->createAppDataFolder('binaries');
		$this->appDataService->createAppDataFolder('logs');
		$url = 'https://github.com/cloud-py-api/mediadc/releases/download/v'
			. Application::PYTHON_BINARY_VERSION
			. '/' . Application::APP_ID . '_' . $this->pythonUtils->getBinaryName() . '.tar.gz';
		$result = $this->pythonUtils->downloadPythonBinaryDir(
			$url, $this->appDataService->getAppDataFolder('binaries'),
			Application::APP_ID,
			Application::APP_ID . '_' . $this->pythonUtils->getBinaryName(),
			true,
			Application::PYTHON_BINARY_SHA256[$this->pythonUtils->getBinaryName()]
		);
		if (!isset($result['downloaded']) || !$result['downloaded']) {
			$output->warning('Failed to download app Python binary');
		}

		$output->finishProgress();
	}
}
