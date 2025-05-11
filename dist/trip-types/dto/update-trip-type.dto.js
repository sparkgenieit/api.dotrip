"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateTripTypeDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_trip_type_dto_1 = require("./create-trip-type.dto");
class UpdateTripTypeDto extends (0, mapped_types_1.PartialType)(create_trip_type_dto_1.CreateTripTypeDto) {
}
exports.UpdateTripTypeDto = UpdateTripTypeDto;
//# sourceMappingURL=update-trip-type.dto.js.map