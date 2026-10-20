<?php

declare(strict_types=1);

/**
 * @license GNU AGPL version 3 or any later version
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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */

namespace OCA\MediaDC\Controller;

use OCA\MediaDC\AppInfo\Application;
use OCP\AppFramework\Controller;
use OCP\AppFramework\Http;
use OCP\AppFramework\Http\Attribute\NoAdminRequired;
use OCP\AppFramework\Http\JSONResponse;
use OCP\Files\Folder;
use OCP\Files\IRootFolder;
use OCP\Files\NotFoundException;
use OCP\Files\NotPermittedException;
use OCP\IRequest;

/**
 * Lists only the subdirectories of a user folder for the directory picker.
 * Unlike a WebDAV PROPFIND it neither serializes the files of the folder
 * nor triggers any preview generation.
 */
class FoldersController extends Controller {
	public function __construct(
		IRequest $request,
		private readonly ?string $userId,
		private readonly IRootFolder $rootFolder,
	) {
		parent::__construct(Application::APP_ID, $request);
	}

	#[NoAdminRequired]
	public function index(string $path = '/'): JSONResponse {
		if ($this->userId === null) {
			return new JSONResponse(['success' => false], Http::STATUS_UNAUTHORIZED);
		}
		try {
			$userFolder = $this->rootFolder->getUserFolder($this->userId);
			$folder = $path === '/' || $path === '' ? $userFolder : $userFolder->get($path);
		} catch (NotFoundException|NotPermittedException) {
			return new JSONResponse(['success' => false], Http::STATUS_NOT_FOUND);
		}
		if (!$folder instanceof Folder) {
			return new JSONResponse(['success' => false], Http::STATUS_BAD_REQUEST);
		}

		$folders = [];
		foreach ($folder->getDirectoryListing() as $node) {
			if (!$node instanceof Folder || str_starts_with($node->getName(), '.')) {
				continue;
			}
			$folders[] = [
				'fileid' => $node->getId(),
				'name' => $node->getName(),
				'path' => $userFolder->getRelativePath($node->getPath()),
			];
		}
		usort($folders, static fn (array $a, array $b) => strnatcasecmp($a['name'], $b['name']));

		return new JSONResponse([
			'success' => true,
			'path' => $userFolder->getRelativePath($folder->getPath()),
			'fileid' => $folder->getId(),
			'folders' => $folders,
		], Http::STATUS_OK);
	}
}
